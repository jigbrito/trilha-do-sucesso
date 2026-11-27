require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Iniciando seed da base de dados Trilha do Sucesso...");
    await client.query("BEGIN");

    // 1. Create Admin & Student
    const adminPass = await bcrypt.hash("admin123", 10);
    const studentPass = await bcrypt.hash("aluno123", 10);

    const adminRes = await client.query(`
      INSERT INTO trilha.users (name, email, password, role, cellphone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        role = EXCLUDED.role,
        password = EXCLUDED.password
      RETURNING id, name, email;
    `, ["Administrador Trilha", "admin@trilhadosucesso.com.br", adminPass, "admin", "11999990001"]);

    const studentRes = await client.query(`
      INSERT INTO trilha.users (name, email, password, role, cellphone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        role = EXCLUDED.role,
        password = EXCLUDED.password
      RETURNING id, name, email;
    `, ["Carlos Silva", "aluno@trilhadosucesso.com.br", studentPass, "student", "11988880002"]);

    console.log("👤 Usuários semeados:", adminRes.rows[0].email, studentRes.rows[0].email);

    // 2. Courses
    const coursesData = [
      {
        title: "Finanças e Precificação para Negócios",
        slug: "financas-e-precificacao",
        description: "Aprenda a controlar o fluxo de caixa, calcular custos fixos e variáveis, definir margens saudáveis e formar o preço ideal para seus produtos e serviços.",
        category: "Finanças",
        level: "Iniciante",
        workload_hours: 6,
        thumbnail_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "1. Introdução ao Fluxo de Caixa e Controle Diário",
            description: "Entenda por que empresas lucrativas podem quebrar sem fluxo de caixa e como controlar entradas e saídas sem planilhas complexas.",
            video_url: "https://www.youtube.com/embed/gH-X4i9j4v8",
            duration_minutes: 14,
            order_index: 1,
          },
          {
            title: "2. Diferenciando Custos Fixos, Variáveis e Despesas",
            description: "Aprenda a classificar com precisão aluguel, matéria-prima, comissões e despesas administrativas.",
            video_url: "https://www.youtube.com/embed/8vX2MDjCq74",
            duration_minutes: 18,
            order_index: 2,
          },
          {
            title: "3. Formação de Preço de Venda e Margem de Lucro",
            description: "Como usar a fórmula do Markup e evitar cobrar menos do que o necessário para cobrir seus custos e lucrar.",
            video_url: "https://www.youtube.com/embed/ysz5S6PUM-U",
            duration_minutes: 20,
            order_index: 3,
          },
          {
            title: "4. Ponto de Equilíbrio (Break-Even Point)",
            description: "Descubra a meta exata de vendas que sua empresa precisa atingir todo mês para começar a dar lucro real.",
            video_url: "https://www.youtube.com/embed/ScMzIvxBSi4",
            duration_minutes: 15,
            order_index: 4,
          }
        ],
        test: {
          title: "Avaliação Final: Finanças e Precificação",
          description: "Teste seus conhecimentos para obter a certificação e comprovar domínio financeiro do seu negócio.",
          passing_score: 70,
          time_limit_minutes: 25,
          questions: [
            {
              question_text: "Qual a principal diferença entre um Custo Fixo e um Custo Variável?",
              points: 25,
              options: [
                { text: "Custos fixos não variam com o volume produzido ou vendido; custos variáveis oscilam diretamente com a produção/venda.", is_correct: true },
                { text: "Custos fixos são sempre mais caros que custos variáveis.", is_correct: false },
                { text: "Custos variáveis ocorrem apenas uma vez por ano.", is_correct: false },
                { text: "Não há diferença técnica, apenas contábil.", is_correct: false }
              ]
            },
            {
              question_text: "O que é o Ponto de Equilíbrio (Break-even point)?",
              points: 25,
              options: [
                { text: "O momento em que as receitas totais se igualam aos custos e despesas totais, com lucro líquido igual a zero.", is_correct: true },
                { text: "O dobro do faturamento mensal da empresa.", is_correct: false },
                { text: "O percentual máximo de desconto permitido nas vendas.", is_correct: false },
                { text: "A média de estoque necessária para 6 meses.", is_correct: false }
              ]
            },
            {
              question_text: "Se um produto custa R$ 50 para produzir e você deseja uma Margem de Contribuição de 50%, qual o preço de venda básico?",
              points: 25,
              options: [
                { text: "R$ 100,00", is_correct: true },
                { text: "R$ 75,00", is_correct: false },
                { text: "R$ 60,00", is_correct: false },
                { text: "R$ 55,00", is_correct: false }
              ]
            },
            {
              question_text: "Por que uma empresa lucrativa no papel pode ter problemas de liquidez financeira?",
              points: 25,
              options: [
                { text: "Devido a descasamento entre prazos de recebimento dos clientes e prazos de pagamento aos fornecedores (fluxo de caixa).", is_correct: true },
                { text: "Porque impostos são cobrados apenas quando a empresa dá prejuízo.", is_correct: false },
                { text: "Porque lucro é um conceito imaginário.", is_correct: false },
                { text: "Porque fornecedores nunca aceitam parcelamentos.", is_correct: false }
              ]
            }
          ]
        }
      },
      {
        title: "Marketing Digital e Vendas Rápidas",
        slug: "marketing-digital-e-vendas",
        description: "Transforme redes sociais e WhatsApp em canais ativos de geração de clientes e faturamento previsível para seu negócio.",
        category: "Marketing",
        level: "Iniciante",
        workload_hours: 5,
        thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "1. Estruturação do Perfil Campeão no Instagram",
            description: "Biografia clara, foto profissional, destaques estratégicos e chamada para ação (CTA) que direciona direto para vendas.",
            video_url: "https://www.youtube.com/embed/L_LUpnjgPso",
            duration_minutes: 16,
            order_index: 1,
          },
          {
            title: "2. WhatsApp Business: Funil e Respostas Rápidas",
            description: "Como usar etiquetas, mensagens automáticas de boas-vindas e catálogo para fechar vendas no primeiro contato.",
            video_url: "https://www.youtube.com/embed/H2i6bQ_wNfs",
            duration_minutes: 18,
            order_index: 2,
          },
          {
            title: "3. Tráfego Pago Básico para Pequenos Negócios",
            description: "Como impulsionar publicações e criar campanhas de mensagens geolocalizadas com apenas R$ 10 a R$ 20 por dia.",
            video_url: "https://www.youtube.com/embed/k5E4bL0Wv2E",
            duration_minutes: 22,
            order_index: 3,
          }
        ],
        test: {
          title: "Avaliação Final: Marketing Digital e Vendas",
          description: "Comprove sua capacidade de atrair público qualificado e convertê-los em clientes pagantes.",
          passing_score: 70,
          time_limit_minutes: 20,
          questions: [
            {
              question_text: "Qual é a principal função de uma Chamada para Ação (CTA)?",
              points: 35,
              options: [
                { text: "Orientar o visitante sobre o próximo passo exato a seguir (ex: 'Clique no link para agendar').", is_correct: true },
                { text: "Aumentar a quantidade de hashtags da publicação.", is_correct: false },
                { text: "Apenas deixar o post mais longo para os algoritmos.", is_correct: false },
                { text: "Esconder o preço do produto para criar suspense.", is_correct: false }
              ]
            },
            {
              question_text: "No WhatsApp Business, para que servem as etiquetas de conversas?",
              points: 35,
              options: [
                { text: "Organizar clientes nas fases do funil de vendas (ex: Novo Lead, Aguardando Pagamento, Pedido Entregue).", is_correct: true },
                { text: "Bloquear contatos indesejados automaticamente.", is_correct: false },
                { text: "Trocar as cores da interface do WhatsApp.", is_correct: false },
                { text: "Fazer ligações gratuitas para o exterior.", is_correct: false }
              ]
            },
            {
              question_text: "Em campanhas de tráfego pago para negócios locais, qual o critério de segmentação mais decisivo?",
              points: 30,
              options: [
                { text: "Raio geográfico em torno do estabelecimento (km de distância).", is_correct: true },
                { text: "Alcançar pessoas em todo o continente.", is_correct: false },
                { text: "Exibir anúncios apenas de madrugada.", is_correct: false },
                { text: "Segmentar somente pessoas que possuem iPhone.", is_correct: false }
              ]
            }
          ]
        }
      },
      {
        title: "Economia Circular e Sustentabilidade",
        slug: "economia-circular-e-sustentabilidade",
        description: "Descubra como reduzir custos operacionais, reaproveitar insumos e gerar valor competitivo através de práticas circulares e sustentáveis.",
        category: "Sustentabilidade",
        level: "Intermediário",
        workload_hours: 4,
        thumbnail_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        lessons: [
          {
            title: "1. Princípios da Economia Circular vs. Economia Linear",
            description: "Superando o modelo de extrair-produzir-descartar: como regenerar materiais e manter valor dentro do ecossistema.",
            video_url: "https://www.youtube.com/embed/zCRKvDyyHmI",
            duration_minutes: 15,
            order_index: 1,
          },
          {
            title: "2. Como Eliminar Desperdícios e Reduzir Despesas",
            description: "Casos reais de micro e pequenas empresas que reduziram despesas em até 30% reaproveitando insumos e energia.",
            video_url: "https://www.youtube.com/embed/6n9f-YkX-h8",
            duration_minutes: 17,
            order_index: 2,
          },
          {
            title: "3. Práticas ESG como Diferencial Competitivo",
            description: "Como comunicar sustentabilidade sem greenwashing e atrair clientes e investidores conscientes.",
            video_url: "https://www.youtube.com/embed/8qj_tG1lK20",
            duration_minutes: 16,
            order_index: 3,
          }
        ],
        test: {
          title: "Avaliação Final: Economia Circular",
          description: "Valide sua compreensão das estratégias regenerativas e de eliminação de resíduos no ambiente corporativo.",
          passing_score: 70,
          time_limit_minutes: 20,
          questions: [
            {
              question_text: "O que caracteriza fundamentalmente o modelo de Economia Circular?",
              points: 35,
              options: [
                { text: "Projetar resíduos para fora do sistema, mantendo produtos e materiais em uso no mais alto valor.", is_correct: true },
                { text: "Apenas utilizar papéis reciclados no escritório.", is_correct: false },
                { text: "Parar de produzir mercadorias industriais.", is_correct: false },
                { text: "Aumentar a extração de matérias-primas virgens.", is_correct: false }
              ]
            },
            {
              question_text: "Qual é o primeiro passo para reduzir desperdícios e custos em uma empresa?",
              points: 35,
              options: [
                { text: "Mapear o fluxo de insumos e mensurar onde ocorrem perdas materiais e energéticas.", is_correct: true },
                { text: "Contratar uma assessoria de imprensa internacional.", is_correct: false },
                { text: "Demitir funcionários da área de limpeza.", is_correct: false },
                { text: "Comprar mais embalagens plásticas descartáveis.", is_correct: false }
              ]
            },
            {
              question_text: "O termo 'Greenwashing' refere-se a:",
              points: 30,
              options: [
                { text: "Propaganda enganosa que divulga falsas práticas ambientais não comprovadas.", is_correct: true },
                { text: "A limpeza de áreas verdes degradadas com voluntários.", is_correct: false },
                { text: "A certificação internacional mais rigorosa de sustentabilidade.", is_correct: false },
                { text: "O tratamento químico de efluentes industriais.", is_correct: false }
              ]
            }
          ]
        }
      }
    ];

    for (const c of coursesData) {
      // Upsert course
      const courseRes = await client.query(`
        INSERT INTO trilha.courses (title, slug, description, category, level, workload_hours, thumbnail_url, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          thumbnail_url = EXCLUDED.thumbnail_url
        RETURNING id, title;
      `, [c.title, c.slug, c.description, c.category, c.level, c.workload_hours, c.thumbnail_url]);

      const courseId = courseRes.rows[0].id;
      console.log(`📚 Curso semeado: [ID ${courseId}] ${c.title}`);

      // Delete old lessons for clean idempotent run
      await client.query("DELETE FROM trilha.lessons WHERE course_id = $1", [courseId]);

      // Insert lessons
      for (const l of c.lessons) {
        await client.query(`
          INSERT INTO trilha.lessons (course_id, title, description, video_url, duration_minutes, order_index)
          VALUES ($1, $2, $3, $4, $5, $6);
        `, [courseId, l.title, l.description, l.video_url, l.duration_minutes, l.order_index]);
      }

      // Upsert test
      const testRes = await client.query(`
        INSERT INTO trilha.tests (course_id, title, description, passing_score, time_limit_minutes, is_published)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (course_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          passing_score = EXCLUDED.passing_score
        RETURNING id;
      `, [courseId, c.test.title, c.test.description, c.test.passing_score, c.test.time_limit_minutes]);

      const testId = testRes.rows[0].id;

      // Delete old questions for clean idempotent run
      await client.query("DELETE FROM trilha.questions WHERE test_id = $1", [testId]);

      // Insert questions and options
      for (let i = 0; i < c.test.questions.length; i++) {
        const q = c.test.questions[i];
        const qRes = await client.query(`
          INSERT INTO trilha.questions (test_id, question_text, points, order_index)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `, [testId, q.question_text, q.points, i + 1]);

        const qId = qRes.rows[0].id;

        for (const opt of q.options) {
          await client.query(`
            INSERT INTO trilha.question_options (question_id, option_text, is_correct)
            VALUES ($1, $2, $3);
          `, [qId, opt.text, opt.is_correct]);
        }
      }
    }

    // Pre-populate student progress on Course 1 so the dashboard is immediately rich and alive
    const studentId = studentRes.rows[0].id;
    const firstCourseRes = await client.query("SELECT id FROM trilha.courses WHERE slug = 'financas-e-precificacao'");
    if (firstCourseRes.rows.length > 0) {
      const c1Id = firstCourseRes.rows[0].id;
      const c1Lessons = await client.query("SELECT id FROM trilha.lessons WHERE course_id = $1 ORDER BY order_index ASC", [c1Id]);
      
      if (c1Lessons.rows.length >= 2) {
        // Mark first 2 lessons as completed
        for (let i = 0; i < 2; i++) {
          await client.query(`
            INSERT INTO trilha.user_lesson_progress (user_id, lesson_id, course_id, completed)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (user_id, lesson_id) DO NOTHING;
          `, [studentId, c1Lessons.rows[i].id, c1Id]);
        }

        // Set course progress to 50%
        await client.query(`
          INSERT INTO trilha.user_course_progress (user_id, course_id, progress_percentage, completed_lessons, total_lessons, last_lesson_id)
          VALUES ($1, $2, 50, 2, $3, $4)
          ON CONFLICT (user_id, course_id) DO UPDATE SET
            progress_percentage = 50,
            completed_lessons = 2,
            total_lessons = EXCLUDED.total_lessons,
            last_lesson_id = EXCLUDED.last_lesson_id;
        `, [studentId, c1Id, c1Lessons.rows.length, c1Lessons.rows[1].id]);
      }
    }

    await client.query("COMMIT");
    console.log("✨ Seed concluído com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro durante o seed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
