import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { challenge_id, question, options, correct_index, reason, enabled } = body;

  if (!challenge_id || !question?.trim()) {
    return Response.json({ error: 'challenge_id and question required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO daily_challenge_questions (challenge_id, question, options, correct_index, reason, enabled)
    VALUES (${challenge_id}, ${question}, ${JSON.stringify(options ?? ['', '', '', ''])}, ${correct_index ?? 0}, ${reason ?? ''}, ${enabled ?? true})
    RETURNING *
  `;
  return Response.json({ question: rows[0] });
}
