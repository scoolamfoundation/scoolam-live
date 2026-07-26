import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    content?: string;
    sort_order?: number;
    is_active?: boolean;
  };

  const setClauses: string[] = [];
  const values: (string | number | boolean)[] = [];
  let paramIdx = 1;

  if (body.title !== undefined) {
    setClauses.push(`title = $${paramIdx++}`);
    values.push(body.title);
  }
  if (body.content !== undefined) {
    setClauses.push(`content = $${paramIdx++}`);
    values.push(body.content);
  }
  if (body.sort_order !== undefined) {
    setClauses.push(`sort_order = $${paramIdx++}`);
    values.push(body.sort_order);
  }
  if (body.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIdx++}`);
    values.push(body.is_active);
  }

  if (setClauses.length === 0)
    return Response.json({ error: 'Nothing to update' }, { status: 400 });

  setClauses.push('updated_at = NOW()');
  values.push(id);

  const query = `UPDATE help_topics SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`;
  const rows = await sql(query, values);
  return Response.json({ topic: rows[0] });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  await sql`DELETE FROM help_topics WHERE id = ${id}`;
  return Response.json({ success: true });
}
