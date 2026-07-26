import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  const body = await request.json();
  const { question, options, correct_index, reason, enabled } = body;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (question !== undefined) {
    setClauses.push(`question = $${idx++}`);
    values.push(question);
  }
  if (options !== undefined) {
    setClauses.push(`options = $${idx++}`);
    values.push(JSON.stringify(options));
  }
  if (correct_index !== undefined) {
    setClauses.push(`correct_index = $${idx++}`);
    values.push(correct_index);
  }
  if (reason !== undefined) {
    setClauses.push(`reason = $${idx++}`);
    values.push(reason);
  }
  if (enabled !== undefined) {
    setClauses.push(`enabled = $${idx++}`);
    values.push(enabled);
  }

  if (setClauses.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const result = await sql(
    `UPDATE questions SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  if (result.length === 0) {
    return Response.json({ error: 'Question not found' }, { status: 404 });
  }
  return Response.json({ question: result[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  await sql`DELETE FROM questions WHERE id = ${id}`;
  return Response.json({ success: true });
}
