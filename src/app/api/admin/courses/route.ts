export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const coursesRes = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT l.id)::int as total_lessons,
        COUNT(DISTINCT p.user_id)::int as total_students,
        CASE WHEN t.id IS NOT NULL THEN true ELSE false END as has_test,
        t.passing_score
      FROM trilha.courses c
      LEFT JOIN trilha.lessons l ON l.course_id = c.id
      LEFT JOIN trilha.user_course_progress p ON p.course_id = c.id
      LEFT JOIN trilha.tests t ON t.course_id = c.id
      GROUP BY c.id, t.id, t.passing_score
      ORDER BY c.id ASC
    `);

    return NextResponse.json({ courses: coursesRes.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, slug, description, category, level, workload_hours, thumbnail_url, is_published } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Título, descrição e categoria são obrigatórios' }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const insertRes = await query(`
      INSERT INTO trilha.courses (title, slug, description, category, level, workload_hours, thumbnail_url, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      title,
      generatedSlug,
      description,
      category,
      level || 'Iniciante',
      workload_hours || 4,
      thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      is_published !== false
    ]);

    return NextResponse.json({ success: true, course: insertRes.rows[0] });
  } catch (err: any) {
    console.error('Error creating course:', err);
    return NextResponse.json({ error: err.message || 'Erro ao criar curso' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, title, description, category, level, workload_hours, thumbnail_url, is_published } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do curso é obrigatório' }, { status: 400 });
    }

    const updateRes = await query(`
      UPDATE trilha.courses SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        level = COALESCE($4, level),
        workload_hours = COALESCE($5, workload_hours),
        thumbnail_url = COALESCE($6, thumbnail_url),
        is_published = COALESCE($7, is_published),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *;
    `, [title, description, category, level, workload_hours, thumbnail_url, is_published, id]);

    return NextResponse.json({ success: true, course: updateRes.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID do curso é obrigatório' }, { status: 400 });

    await query('DELETE FROM trilha.courses WHERE id = $1', [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
