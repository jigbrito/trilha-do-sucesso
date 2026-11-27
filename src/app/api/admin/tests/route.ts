export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');
    const testId = searchParams.get('test_id');

    let whereClause = '';
    let params: any[] = [];
    if (testId) {
      whereClause = 'WHERE t.id = $1';
      params = [parseInt(testId, 10)];
    } else if (courseId) {
      whereClause = 'WHERE t.course_id = $1';
      params = [parseInt(courseId, 10)];
    } else {
      return NextResponse.json({ error: 'course_id ou test_id é obrigatório' }, { status: 400 });
    }

    const testRes = await query(`
      SELECT t.*, c.title as course_title 
      FROM trilha.tests t
      JOIN trilha.courses c ON c.id = t.course_id
      ${whereClause}
      LIMIT 1
    `, params);

    if (testRes.rows.length === 0) {
      return NextResponse.json({ test: null });
    }

    const test = testRes.rows[0];

    // Fetch questions and options with is_correct (admin view)
    const questionsRes = await query(`
      SELECT id, test_id, question_text, explanation, points, order_index
      FROM trilha.questions
      WHERE test_id = $1
      ORDER BY order_index ASC
    `, [test.id]);

    for (const q of questionsRes.rows) {
      const optionsRes = await query(`
        SELECT id, question_id, option_text, is_correct
        FROM trilha.question_options
        WHERE question_id = $1
        ORDER BY id ASC
      `, [q.id]);
      q.options = optionsRes.rows;
    }

    test.questions = questionsRes.rows;

    return NextResponse.json({ test });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { course_id, title, description, passing_score, time_limit_minutes, questions } = body;

    if (!course_id || !title) {
      return NextResponse.json({ error: 'Curso e título da avaliação são obrigatórios' }, { status: 400 });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const testRes = await client.query(`
        INSERT INTO trilha.tests (course_id, title, description, passing_score, time_limit_minutes, is_published)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (course_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          passing_score = EXCLUDED.passing_score,
          time_limit_minutes = EXCLUDED.time_limit_minutes
        RETURNING id;
      `, [course_id, title, description || '', passing_score || 70, time_limit_minutes || 30]);

      const testId = testRes.rows[0].id;

      if (Array.isArray(questions)) {
        // Clear old questions
        await client.query('DELETE FROM trilha.questions WHERE test_id = $1', [testId]);

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const qRes = await client.query(`
            INSERT INTO trilha.questions (test_id, question_text, points, order_index)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
          `, [testId, q.question_text, q.points || 10, i + 1]);

          const qId = qRes.rows[0].id;

          if (Array.isArray(q.options)) {
            for (const opt of q.options) {
              await client.query(`
                INSERT INTO trilha.question_options (question_id, option_text, is_correct)
                VALUES ($1, $2, $3);
              `, [qId, opt.option_text, Boolean(opt.is_correct)]);
            }
          }
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, test_id: testId });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error saving test:', err);
    return NextResponse.json({ error: err.message || 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
