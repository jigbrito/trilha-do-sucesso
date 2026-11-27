import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const lessonId = parseInt(params.id, 10);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'ID da aula inválido' }, { status: 400 });
    }

    // Verify lesson exists and get course_id
    const lessonRes = await query(
      'SELECT id, course_id FROM trilha.lessons WHERE id = $1 LIMIT 1',
      [lessonId]
    );

    if (lessonRes.rows.length === 0) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
    }

    const { course_id } = lessonRes.rows[0];

    // Toggle completion status
    const currentStatus = await query(
      'SELECT completed FROM trilha.user_lesson_progress WHERE user_id = $1 AND lesson_id = $2 LIMIT 1',
      [user.id, lessonId]
    );

    let newStatus = true;
    if (currentStatus.rows.length > 0) {
      newStatus = !currentStatus.rows[0].completed;
      await query(
        'UPDATE trilha.user_lesson_progress SET completed = $1, completed_at = NOW() WHERE user_id = $2 AND lesson_id = $3',
        [newStatus, user.id, lessonId]
      );
    } else {
      await query(
        'INSERT INTO trilha.user_lesson_progress (user_id, lesson_id, course_id, completed, completed_at) VALUES ($1, $2, $3, true, NOW())',
        [user.id, lessonId, course_id]
      );
    }

    // Recalculate total course progress
    const totalLessonsRes = await query(
      'SELECT COUNT(*)::int as count FROM trilha.lessons WHERE course_id = $1',
      [course_id]
    );
    const totalLessons = totalLessonsRes.rows[0].count;

    const completedLessonsRes = await query(
      'SELECT COUNT(*)::int as count FROM trilha.user_lesson_progress WHERE user_id = $1 AND course_id = $2 AND completed = true',
      [user.id, course_id]
    );
    const completedLessons = completedLessonsRes.rows[0].count;

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const isCompleted = progressPercentage >= 100;

    await query(`
      INSERT INTO trilha.user_course_progress (
        user_id, course_id, progress_percentage, completed_lessons, total_lessons, last_lesson_id, completed_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, ${isCompleted ? 'NOW()' : 'NULL'}, NOW())
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        completed_lessons = EXCLUDED.completed_lessons,
        total_lessons = EXCLUDED.total_lessons,
        last_lesson_id = EXCLUDED.last_lesson_id,
        completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100 THEN NOW() ELSE trilha.user_course_progress.completed_at END,
        updated_at = NOW()
    `, [user.id, course_id, progressPercentage, completedLessons, totalLessons, lessonId]);

    return NextResponse.json({
      success: true,
      lesson_id: lessonId,
      is_completed: newStatus,
      course_progress: {
        progress_percentage: progressPercentage,
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
      },
    });
  } catch (err: any) {
    console.error('Error toggling lesson progress:', err);
    return NextResponse.json({ error: err.message || 'Erro ao atualizar progresso' }, { status: 500 });
  }
}
