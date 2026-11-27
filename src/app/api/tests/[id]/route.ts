export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const testId = parseInt(params.id, 10);
    if (isNaN(testId)) {
      return NextResponse.json({ error: 'ID da avaliação inválido' }, { status: 400 });
    }

    // 1. Fetch test and course information
    const testRes = await query(`
      SELECT 
        t.id, t.course_id, t.title, t.description, t.passing_score, t.time_limit_minutes,
        c.title AS course_title, c.slug AS course_slug
      FROM trilha.tests t
      JOIN trilha.courses c ON c.id = t.course_id
      WHERE t.id = $1 AND t.is_published = true
      LIMIT 1
    `, [testId]);

    if (testRes.rows.length === 0) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    const test = testRes.rows[0];

    // 2. Fetch questions
    const questionsRes = await query(`
      SELECT id, test_id, question_text, explanation, points, order_index
      FROM trilha.questions
      WHERE test_id = $1
      ORDER BY order_index ASC
    `, [testId]);

    const questions = questionsRes.rows;

    // 3. Fetch options for each question — STRICTLY EXCLUDING is_correct FOR SECURITY
    for (const q of questions) {
      const optionsRes = await query(`
        SELECT id, question_id, option_text
        FROM trilha.question_options
        WHERE question_id = $1
        ORDER BY id ASC
      `, [q.id]);
      q.options = optionsRes.rows;
    }

    // 4. Fetch previous submissions by this student
    const historyRes = await query(`
      SELECT id, score, total_points, percentage, passed, submitted_at
      FROM trilha.submissions
      WHERE test_id = $1 AND user_id = $2
      ORDER BY submitted_at DESC
    `, [testId, user.id]);

    return NextResponse.json({
      test: {
        ...test,
        questions,
        submissions_count: historyRes.rows.length,
        last_submission: historyRes.rows[0] || null,
      }
    });
  } catch (err: any) {
    console.error('Error fetching test:', err);
    return NextResponse.json({ error: err.message || 'Erro ao carregar avaliação' }, { status: 500 });
  }
}
