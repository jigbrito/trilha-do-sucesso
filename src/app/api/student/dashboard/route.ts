export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    // 1. Ongoing or completed courses with progress
    const coursesRes = await query(`
      SELECT 
        c.id, c.title, c.slug, c.description, c.category, c.thumbnail_url, c.workload_hours,
        COUNT(l.id)::int as total_lessons,
        COALESCE(p.progress_percentage, 0) as progress_percentage,
        COALESCE(p.completed_lessons, 0) as completed_lessons,
        p.completed_at,
        p.last_lesson_id
      FROM trilha.courses c
      LEFT JOIN trilha.lessons l ON l.course_id = c.id
      LEFT JOIN trilha.user_course_progress p ON p.course_id = c.id AND p.user_id = $1
      WHERE c.is_published = true
      GROUP BY c.id, p.progress_percentage, p.completed_lessons, p.completed_at, p.last_lesson_id
      ORDER BY p.progress_percentage DESC NULLS LAST, c.id ASC
    `, [user.id]);

    const courses = coursesRes.rows;

    // 2. Pending assessments (courses where progress >= 100% or tests not yet passed)
    const pendingTestsRes = await query(`
      SELECT 
        t.id, t.course_id, t.title as test_title, t.passing_score,
        c.title as course_title, c.slug as course_slug,
        s.percentage as last_percentage, s.passed as has_passed
      FROM trilha.tests t
      JOIN trilha.courses c ON c.id = t.course_id
      LEFT JOIN (
        SELECT DISTINCT ON (test_id) test_id, percentage, passed
        FROM trilha.submissions
        WHERE user_id = $1
        ORDER BY test_id, percentage DESC, submitted_at DESC
      ) s ON s.test_id = t.id
      WHERE t.is_published = true AND (s.passed IS NULL OR s.passed = false)
      ORDER BY t.id ASC
    `, [user.id]);

    // 3. Recent grades and submissions
    const recentGradesRes = await query(`
      SELECT 
        s.id, s.score, s.total_points, s.percentage, s.passed, s.submitted_at,
        t.title as test_title,
        c.title as course_title, c.slug as course_slug
      FROM trilha.submissions s
      JOIN trilha.tests t ON t.id = s.test_id
      JOIN trilha.courses c ON c.id = s.course_id
      WHERE s.user_id = $1
      ORDER BY s.submitted_at DESC
      LIMIT 5
    `, [user.id]);

    // 4. Overall statistics
    const statsRes = await query(`
      SELECT 
        COUNT(DISTINCT s.id)::int as total_tests_taken,
        COALESCE(ROUND(AVG(s.percentage)), 0)::int as average_grade,
        COUNT(DISTINCT CASE WHEN s.passed = true THEN s.course_id END)::int as certified_courses
      FROM trilha.submissions s
      WHERE s.user_id = $1
    `, [user.id]);

    const completedLessonsCountRes = await query(`
      SELECT COUNT(*)::int as count 
      FROM trilha.user_lesson_progress 
      WHERE user_id = $1 AND completed = true
    `, [user.id]);

    const stats = {
      ...statsRes.rows[0],
      completed_lessons_count: completedLessonsCountRes.rows[0].count,
    };

    return NextResponse.json({
      user,
      stats,
      courses,
      pending_tests: pendingTestsRes.rows,
      recent_grades: recentGradesRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching student dashboard:', err);
    return NextResponse.json({ error: err.message || 'Erro ao carregar painel do aluno' }, { status: 500 });
  }
}
