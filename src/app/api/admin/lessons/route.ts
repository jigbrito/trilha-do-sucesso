import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { course_id, title, description, video_url, duration_minutes, order_index } = body;

    if (!course_id || !title || !video_url) {
      return NextResponse.json({ error: 'Curso, título e URL do vídeo são obrigatórios' }, { status: 400 });
    }

    // Determine order_index if not provided
    let finalOrder = order_index;
    if (!finalOrder) {
      const maxOrderRes = await query(
        'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM trilha.lessons WHERE course_id = $1',
        [course_id]
      );
      finalOrder = maxOrderRes.rows[0].next_order;
    }

    const insertRes = await query(`
      INSERT INTO trilha.lessons (course_id, title, description, video_url, duration_minutes, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [course_id, title, description || '', video_url, duration_minutes || 15, finalOrder]);

    return NextResponse.json({ success: true, lesson: insertRes.rows[0] });
  } catch (err: any) {
    console.error('Error creating lesson:', err);
    return NextResponse.json({ error: err.message || 'Erro ao adicionar aula' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, title, description, video_url, duration_minutes, order_index } = body;

    if (!id) return NextResponse.json({ error: 'ID da aula é obrigatório' }, { status: 400 });

    const updateRes = await query(`
      UPDATE trilha.lessons SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        video_url = COALESCE($3, video_url),
        duration_minutes = COALESCE($4, duration_minutes),
        order_index = COALESCE($5, order_index)
      WHERE id = $6
      RETURNING *;
    `, [title, description, video_url, duration_minutes, order_index, id]);

    return NextResponse.json({ success: true, lesson: updateRes.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID da aula é obrigatório' }, { status: 400 });

    await query('DELETE FROM trilha.lessons WHERE id = $1', [parseInt(id, 10)]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
