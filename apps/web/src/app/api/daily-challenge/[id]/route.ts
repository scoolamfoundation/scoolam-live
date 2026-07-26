import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rows = await sql`SELECT * FROM daily_challenges WHERE id = ${id}`;
  if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 });

  const questions = await sql`
    SELECT * FROM daily_challenge_questions WHERE challenge_id = ${id} ORDER BY id ASC
  `;

  return Response.json({ challenge: rows[0], questions });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { title, description, quiz_duration, total_questions, shuffle_questions, is_active } = body;

  const rows = await sql`
    UPDATE daily_challenges SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      quiz_duration = COALESCE(${quiz_duration ?? null}, quiz_duration),
      total_questions = COALESCE(${total_questions ?? null}, total_questions),
      shuffle_questions = COALESCE(${shuffle_questions ?? null}, shuffle_questions),
      is_active = COALESCE(${is_active ?? null}, is_active)
    WHERE id = ${id}
    RETURNING *
  `;
  return Response.json({ challenge: rows[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await sql`DELETE FROM daily_challenges WHERE id = ${id}`;
  return Response.json({ success: true });
}
