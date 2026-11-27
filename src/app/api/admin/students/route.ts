export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    // List all students with learning progress summary
    const studentsRes = await query(`
      SELECT 
        u.id, u.name, u.email, u.cellphone, u.created_at,
        COUNT(DISTINCT p.course_id)::int as courses_enrolled,
        COUNT(DISTINCT CASE WHEN p.progress_percentage = 100 THEN p.course_id END)::int as courses_completed,
        COUNT(DISTINCT s.id)::int as tests_taken,
        COALESCE(ROUND(AVG(s.percentage)), 0)::int as average_grade
      FROM trilha.users u
      LEFT JOIN trilha.user_course_progress p ON p.user_id = u.id
      LEFT JOIN trilha.submissions s ON s.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({ students: studentsRes.rows });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: err.message || 'Erro ao listar alunos' }, { status: 403 });
  }
}
