export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id, 10);
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'ID do curso inválido' }, { status: 400 });
    }

    const user = await getCurrentUser();

    // 1. Fetch course details
    const courseRes = await query(
      'SELECT * FROM trilha.courses WHERE id = $1 LIMIT 1',
      [courseId]
    );

    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    }

    const course = courseRes.rows[0];

    // 2. Fetch lessons in order
    const lessonsRes = await query(
      'SELECT id, course_id, title, description, video_url, duration_minutes, order_index FROM trilha.lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    );

    let lessons = lessonsRes.rows;

    // 3. If user is logged in, mark which lessons are completed
    let userProgress = {
      progress_percentage: 0,
      completed_lessons: 0,
      completed_at: null,
    };

    if (user) {
      const completedRes = await query(
        'SELECT lesson_id FROM trilha.user_lesson_progress WHERE user_id = $1 AND course_id = $2 AND completed = true',
        [user.id, courseId]
      );
      const completedSet = new Set(completedRes.rows.map((r) => r.lesson_id));

      lessons = lessons.map((l) => ({
        ...l,
        is_completed: completedSet.has(l.id),
      }));

      const progressRes = await query(
        'SELECT progress_percentage, completed_lessons, completed_at FROM trilha.user_course_progress WHERE user_id = $1 AND course_id = $2 LIMIT 1',
        [user.id, courseId]
      );
      if (progressRes.rows.length > 0) {
        userProgress = progressRes.rows[0];
      }
    }

    // 4. Fetch test info (without leaking questions answers)
    const testRes = await query(
      'SELECT id, title, description, passing_score, time_limit_minutes FROM trilha.tests WHERE course_id = $1 AND is_published = true LIMIT 1',
      [courseId]
    );

    let test = testRes.rows.length > 0 ? testRes.rows[0] : null;

    if (test && user) {
      // Check if student has taken this test
      const subRes = await query(
        'SELECT id, score, total_points, percentage, passed, submitted_at FROM trilha.submissions WHERE user_id = $1 AND test_id = $2 ORDER BY percentage DESC, submitted_at DESC LIMIT 1',
        [user.id, test.id]
      );
      if (subRes.rows.length > 0) {
        test.last_submission = subRes.rows[0];
      }
    }

    return NextResponse.json({
      course,
      lessons,
      test,
      user_progress: userProgress,
    });
  } catch (err: any) {
    console.error('Error fetching course:', err);
    return NextResponse.json({ error: 'Erro ao carregar curso' }, { status: 500 });
  }
}
