export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Fetch published courses with lesson counts
    const coursesRes = await query(`
      SELECT 
        c.*,
        COUNT(l.id)::int AS total_lessons
      FROM trilha.courses c
      LEFT JOIN trilha.lessons l ON l.course_id = c.id
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    let courses = coursesRes.rows;

    // If user is authenticated, attach their progress
    if (user) {
      const progressRes = await query(
        `SELECT course_id, progress_percentage, completed_lessons, completed_at
         FROM trilha.user_course_progress
         WHERE user_id = $1`,
        [user.id]
      );

      const progressMap = new Map();
      progressRes.rows.forEach((p) => {
        progressMap.set(p.course_id, p);
      });

      courses = courses.map((c) => ({
        ...c,
        user_progress: progressMap.get(c.id) || {
          progress_percentage: 0,
          completed_lessons: 0,
          completed_at: null,
        },
      }));
    }

    return NextResponse.json({ courses });
  } catch (err: any) {
    console.error('Error fetching courses:', err);
    return NextResponse.json({ error: 'Erro ao buscar cursos' }, { status: 500 });
  }
}
