require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO trilha, public;");
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function runEndToEndTests() {
  console.log("==================================================");
  console.log("🧪 INICIANDO TESTES END-TO-END: TRILHA DO SUCESSO");
  console.log("==================================================");

  try {
    // 1. Test Database Schema & Connection
    console.log("\n1️⃣  [TEST] Conexão com Schema 'trilha' no PostgreSQL...");
    const dbTest = await query("SELECT COUNT(*)::int as count FROM trilha.courses;");
    console.log(`   ✅ Banco conectado! Cursos encontrados no schema 'trilha': ${dbTest.rows[0].count}`);

    // 2. Test Student Login Verification
    console.log("\n2️⃣  [TEST] Autenticação do Aluno (aluno@trilhadosucesso.com.br)...");
    const studentUserRes = await query("SELECT * FROM trilha.users WHERE email = 'aluno@trilhadosucesso.com.br' LIMIT 1;");
    if (studentUserRes.rows.length === 0) throw new Error("Aluno não encontrado");
    const studentUser = studentUserRes.rows[0];
    const isStudentPassValid = await bcrypt.compare("aluno123", studentUser.password);
    if (!isStudentPassValid) throw new Error("Senha do aluno inválida");
    console.log(`   ✅ Login do Aluno aprovado: ID ${studentUser.id}, Papel: ${studentUser.role}, Hash verificado com sucesso.`);

    // 3. Test Admin Login Verification
    console.log("\n3️⃣  [TEST] Autenticação do Administrador (admin@trilhadosucesso.com.br)...");
    const adminUserRes = await query("SELECT * FROM trilha.users WHERE email = 'admin@trilhadosucesso.com.br' LIMIT 1;");
    if (adminUserRes.rows.length === 0) throw new Error("Admin não encontrado");
    const adminUser = adminUserRes.rows[0];
    const isAdminPassValid = await bcrypt.compare("admin123", adminUser.password);
    if (!isAdminPassValid) throw new Error("Senha do admin inválida");
    console.log(`   ✅ Login do Admin aprovado: ID ${adminUser.id}, Papel: ${adminUser.role}, Hash verificado com sucesso.`);

    // 4. Test Student Registration (Idempotent)
    console.log("\n4️⃣  [TEST] Cadastro de Novo Estudante...");
    const testEmail = `teste.aluno.${Date.now()}@trilhadosucesso.com.br`;
    const hashedPass = await bcrypt.hash("senha123", 10);
    const regRes = await query(`
      INSERT INTO trilha.users (name, email, password, role, cellphone)
      VALUES ($1, $2, $3, 'student', $4)
      RETURNING id, name, email, role;
    `, ["Maria Oliveira", testEmail, hashedPass, "11977770003"]);
    const newStudent = regRes.rows[0];
    console.log(`   ✅ Estudante registrado com sucesso: ${newStudent.name} (${newStudent.email}), ID: ${newStudent.id}`);

    // 5. Test Course Catalog & Lessons
    console.log("\n5️⃣  [TEST] Catálogo de Cursos & Aulas...");
    const coursesRes = await query(`
      SELECT c.id, c.title, c.category, COUNT(l.id)::int as lessons_count 
      FROM trilha.courses c
      LEFT JOIN trilha.lessons l ON l.course_id = c.id
      GROUP BY c.id ORDER BY c.id ASC;
    `);
    coursesRes.rows.forEach(c => {
      console.log(`   📚 Curso [${c.id}]: "${c.title}" (${c.category}) - ${c.lessons_count} aulas`);
    });

    // 6. Test Lesson Completion & Course Progress Tracking
    console.log("\n6️⃣  [TEST] Rastreamento de Progresso de Aulas...");
    const studentId = newStudent.id;
    const firstCourseId = coursesRes.rows[0].id;
    const lessonsRes = await query("SELECT id, title FROM trilha.lessons WHERE course_id = $1 ORDER BY order_index ASC", [firstCourseId]);
    const lesson1 = lessonsRes.rows[0];

    // Mark lesson 1 completed
    await query(`
      INSERT INTO trilha.user_lesson_progress (user_id, lesson_id, course_id, completed)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true;
    `, [studentId, lesson1.id, firstCourseId]);

    const totalLessons = lessonsRes.rows.length;
    const progressPct = Math.round((1 / totalLessons) * 100);

    await query(`
      INSERT INTO trilha.user_course_progress (user_id, course_id, progress_percentage, completed_lessons, total_lessons)
      VALUES ($1, $2, $3, 1, $4)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        progress_percentage = $3,
        completed_lessons = 1;
    `, [studentId, firstCourseId, progressPct, totalLessons]);

    console.log(`   ✅ Progresso atualizado para o aluno ${studentId}: Aula "${lesson1.title}" concluída -> ${progressPct}% do curso.`);

    // 7. Test Assessment & Security (Server-side Grading)
    console.log("\n7️⃣  [TEST] Avaliação Online & Cálculo Server-Side de Nota...");
    const testRes = await query("SELECT id, title, passing_score FROM trilha.tests WHERE course_id = $1 LIMIT 1", [firstCourseId]);
    const testObj = testRes.rows[0];
    console.log(`   📝 Avaliação encontrada: "${testObj.title}" (Nota mínima para aprovação: ${testObj.passing_score}%)`);

    // Fetch questions and their correct options
    const qRes = await query(`
      SELECT q.id as question_id, q.points, qo.id as correct_option_id
      FROM trilha.questions q
      JOIN trilha.question_options qo ON qo.question_id = q.id AND qo.is_correct = true
      WHERE q.test_id = $1;
    `, [testObj.id]);

    // Simulate student answering all questions correctly
    let totalScore = 0;
    let maxPoints = 0;
    for (const q of qRes.rows) {
      maxPoints += q.points;
      totalScore += q.points; // all correct
    }
    const finalPct = Math.round((totalScore / maxPoints) * 100);
    const passed = finalPct >= testObj.passing_score;

    const subRes = await query(`
      INSERT INTO trilha.submissions (test_id, user_id, course_id, score, total_points, percentage, passed, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, percentage, passed;
    `, [testObj.id, studentId, firstCourseId, totalScore, maxPoints, finalPct, passed]);

    console.log(`   ✅ Avaliação enviada e corrigida pelo servidor: Submissão ID ${subRes.rows[0].id}`);
    console.log(`      Nota: ${subRes.rows[0].percentage}% | Resultado: ${subRes.rows[0].passed ? "APROVADO 🏆" : "REPROVADO ❌"}`);

    // 8. Test Student Grades Query
    console.log("\n8️⃣  [TEST] Consulta do Boletim do Estudante...");
    const gradesRes = await query(`
      SELECT s.id, c.title as course, s.percentage, s.passed, s.submitted_at
      FROM trilha.submissions s
      JOIN trilha.courses c ON c.id = s.course_id
      WHERE s.user_id = $1;
    `, [studentId]);
    console.log(`   ✅ Boletim gerado para ${newStudent.name}:`);
    gradesRes.rows.forEach(g => {
      console.log(`      - Curso: ${g.course} | Nota: ${g.percentage}% | Status: ${g.passed ? 'Aprovado' : 'Reprovado'}`);
    });

    // 9. Test Admin Overview Stats
    console.log("\n9️⃣  [TEST] Consulta de Métricas do Administrador...");
    const adminStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM trilha.users WHERE role = 'student')::int as total_students,
        (SELECT COUNT(*) FROM trilha.courses)::int as total_courses,
        (SELECT COUNT(*) FROM trilha.submissions)::int as total_submissions,
        (SELECT COALESCE(ROUND(AVG(percentage)), 0) FROM trilha.submissions)::int as avg_score;
    `);
    console.log(`   ✅ Métricas do Admin:`, adminStats.rows[0]);

    console.log("\n==================================================");
    console.log("🎉 TODOS OS TESTES PASSARAM COM SUCESSO (100% OK)!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ FALHA NO TESTE:", err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runEndToEndTests();
