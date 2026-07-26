import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const rows = await sql`SELECT * FROM issue_reports ORDER BY created_at DESC LIMIT 200`;
  const unread = await sql`SELECT COUNT(*) as cnt FROM issue_reports WHERE is_read = FALSE`;
  return Response.json({ reports: rows, unread_count: Number(unread[0]?.cnt ?? 0) });
}

export async function PATCH(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = (await request.json()) as { id: number; status?: string; is_read?: boolean };

  const setClauses: string[] = [];
  const values: (string | boolean | number)[] = [];
  let idx = 1;

  if (body.status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    values.push(body.status);
  }
  if (body.is_read !== undefined) {
    setClauses.push(`is_read = $${idx++}`);
    values.push(body.is_read);
  }

  if (setClauses.length === 0)
    return Response.json({ error: 'Nothing to update' }, { status: 400 });

  values.push(body.id);
  const query = `UPDATE issue_reports SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
  const rows = await sql(query, values);
  return Response.json({ report: rows[0] });
}
