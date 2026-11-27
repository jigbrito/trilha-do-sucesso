export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await requireAdmin();

    // 1. Total counts
    const studentsCountRes = await query(
      "SELECT COUNT(*)::int as count FROM trilha.users WHERE role = 'student'"
    );
    const coursesCountRes = await query(
      "SELECT COUNT(*)::int as count FROM trilha.courses"
    );
    const lessonsCompletedCountRes = await query(
      "SELECT COUNT(*)::int as count FROM trilha.user_lesson_progress WHERE completed = true"
    );
    const submissionsRes = await query(`
      SELECT 
        COUNT(*)::int as total_submissions,
        COUNT(CASE WHEN passed = true THEN 1 END)::int as passed_count,
        COALESCE(ROUND(AVG(percentage)), 0)::int as average_score
      FROM trilha.submissions
    `);

    // 2. Recent student submissions
    const recentSubmissionsRes = await query(`
      SELECT 
        s.id, s.score, s.total_points, s.percentage, s.passed, s.submitted_at,
        u.name as student_name, u.email as student_email,
        c.title as course_title,
        t.title as test_title
      FROM trilha.submissions s
      JOIN trilha.users u ON u.id = s.user_id
      JOIN trilha.courses c ON c.id = s.course_id
      JOIN trilha.tests t ON t.id = s.test_id
      ORDER BY s.submitted_at DESC
      LIMIT 8
    `);

    // 3. Popular courses with enrollment / completion rates
    const coursesStatsRes = await query(`
      SELECT 
        c.id, c.title, c.category,
        COUNT(DISTINCT p.user_id)::int as active_students,
        COUNT(DISTINCT CASE WHEN p.progress_percentage = 100 THEN p.user_id END)::int as completed_students
      FROM trilha.courses c
      LEFT JOIN trilha.user_course_progress p ON p.course_id = c.id
      GROUP BY c.id
      ORDER BY active_students DESC
      LIMIT 5
    `);

    return NextResponse.json({
      admin,
      stats: {
        total_students: studentsCountRes.rows[0].count,
        total_courses: coursesCountRes.rows[0].count,
        lessons_completed: lessonsCompletedCountRes.rows[0].count,
        total_submissions: submissionsRes.rows[0].total_submissions,
        passed_submissions: submissionsRes.rows[0].passed_count,
        average_score: submissionsRes.rows[0].average_score,
        pass_rate: submissionsRes.rows[0].total_submissions > 0
          ? Math.round((submissionsRes.rows[0].passed_count / submissionsRes.rows[0].total_submissions) * 100)
          : 0,
      },
      recent_submissions: recentSubmissionsRes.rows,
      popular_courses: coursesStatsRes.rows,
    });
  } catch (err: any) {
    console.error('Admin overview error:', err);
    return NextResponse.json({ error: err.message || 'Erro ao carregar dados do admin' }, { status: 403 });
  }
}
