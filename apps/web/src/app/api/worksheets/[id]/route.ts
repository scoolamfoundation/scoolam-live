import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM worksheets WHERE id = ${id}`;
  if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ worksheet: rows[0] });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  const body = await request.json();
  const { title, description, file_url, is_premium } = body;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(title);
  }
  if (description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(description);
  }
  if (file_url !== undefined) {
    setClauses.push(`file_url = $${idx++}`);
    values.push(file_url);
  }
  if (is_premium !== undefined) {
    setClauses.push(`is_premium = $${idx++}`);
    values.push(is_premium);
  }

  if (!setClauses.length) return Response.json({ error: 'No fields to update' }, { status: 400 });

  values.push(id);
  const result = await sql(
    `UPDATE worksheets SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (!result[0]) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ worksheet: result[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  await sql`DELETE FROM worksheets WHERE id = ${id}`;
  return Response.json({ success: true });
}
