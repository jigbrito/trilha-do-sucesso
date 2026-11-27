export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('course_id');

    let sql = `
      SELECT 
        s.id, s.score, s.total_points, s.percentage, s.passed, s.submitted_at,
        u.name as student_name, u.email as student_email,
        c.title as course_title,
        t.title as test_title, t.passing_score
      FROM trilha.submissions s
      JOIN trilha.users u ON u.id = s.user_id
      JOIN trilha.courses c ON c.id = s.course_id
      JOIN trilha.tests t ON t.id = s.test_id
    `;
    const params: any[] = [];

    if (courseId) {
      sql += ' WHERE s.course_id = $1';
      params.push(parseInt(courseId, 10));
    }

    sql += ' ORDER BY s.submitted_at DESC';

    const res = await query(sql, params);
    return NextResponse.json({ submissions: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
