import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { question, options, correct_index, reason, enabled } = body;

  const rows = await sql`
    UPDATE daily_challenge_questions SET
      question = COALESCE(${question ?? null}, question),
      options = COALESCE(${options ? JSON.stringify(options) : null}::jsonb, options),
      correct_index = COALESCE(${correct_index ?? null}, correct_index),
      reason = COALESCE(${reason ?? null}, reason),
      enabled = COALESCE(${enabled ?? null}, enabled)
    WHERE id = ${id}
    RETURNING *
  `;
  return Response.json({ question: rows[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await sql`DELETE FROM daily_challenge_questions WHERE id = ${id}`;
  return Response.json({ success: true });
}
