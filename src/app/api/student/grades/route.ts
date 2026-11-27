export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch all submissions for the authenticated student only
    const gradesRes = await query(`
      SELECT 
        s.id, s.score, s.total_points, s.percentage, s.passed, s.submitted_at,
        t.id as test_id, t.title as test_title, t.passing_score,
        c.id as course_id, c.title as course_title, c.slug as course_slug, c.category
      FROM trilha.submissions s
      JOIN trilha.tests t ON t.id = s.test_id
      JOIN trilha.courses c ON c.id = s.course_id
      WHERE s.user_id = $1
      ORDER BY s.submitted_at DESC
    `, [user.id]);

    return NextResponse.json({
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      submissions: gradesRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching student grades:', err);
    return NextResponse.json({ error: err.message || 'Erro ao buscar notas' }, { status: 500 });
  }
}
