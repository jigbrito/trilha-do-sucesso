import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const testId = parseInt(params.id, 10);
    if (isNaN(testId)) {
      return NextResponse.json({ error: 'ID da avaliação inválido' }, { status: 400 });
    }

    const body = await req.json();
    const answers: Record<string, number> = body.answers || {};

    // 1. Fetch test details
    const testRes = await query(
      'SELECT id, course_id, title, passing_score FROM trilha.tests WHERE id = $1 AND is_published = true LIMIT 1',
      [testId]
    );

    if (testRes.rows.length === 0) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    const test = testRes.rows[0];

    // 2. Fetch all questions and their correct options from database
    const questionsRes = await query(`
      SELECT 
        q.id as question_id,
        q.question_text,
        q.points,
        qo.id as correct_option_id,
        qo.option_text as correct_option_text
      FROM trilha.questions q
      JOIN trilha.question_options qo ON qo.question_id = q.id AND qo.is_correct = true
      WHERE q.test_id = $1
    `, [testId]);

    if (questionsRes.rows.length === 0) {
      return NextResponse.json({ error: 'Esta avaliação não possui questões cadastradas' }, { status: 400 });
    }

    // 3. Calculate score strictly server-side
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerAudits: {
      question_id: number;
      selected_option_id: number;
      is_correct: boolean;
      points_earned: number;
    }[] = [];

    for (const q of questionsRes.rows) {
      totalPoints += q.points;
      const selectedOptionId = answers[q.question_id] || answers[String(q.question_id)];
      const isCorrect = Number(selectedOptionId) === Number(q.correct_option_id);
      
      if (isCorrect) {
        earnedPoints += q.points;
      }

      answerAudits.push({
        question_id: q.question_id,
        selected_option_id: selectedOptionId || 0,
        is_correct: isCorrect,
        points_earned: isCorrect ? q.points : 0,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= test.passing_score;

    // 4. Save submission inside transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const subInsert = await client.query(`
        INSERT INTO trilha.submissions (test_id, user_id, course_id, score, total_points, percentage, passed, submitted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, submitted_at;
      `, [testId, user.id, test.course_id, earnedPoints, totalPoints, percentage, passed]);

      const submissionId = subInsert.rows[0].id;

      for (const a of answerAudits) {
        if (a.selected_option_id > 0) {
          await client.query(`
            INSERT INTO trilha.submission_answers (submission_id, question_id, selected_option_id, is_correct)
            VALUES ($1, $2, $3, $4);
          `, [submissionId, a.question_id, a.selected_option_id, a.is_correct]);
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        submission: {
          id: submissionId,
          score: earnedPoints,
          total_points: totalPoints,
          percentage,
          passed,
          passing_score: test.passing_score,
          correct_count: answerAudits.filter(a => a.is_correct).length,
          total_questions: questionsRes.rows.length,
          submitted_at: subInsert.rows[0].submitted_at,
        }
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error submitting test:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar envio da avaliação' }, { status: 500 });
  }
}
