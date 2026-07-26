import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  // Return up to 5 active daily challenges for the carousel
  const rows = await sql`
    SELECT dc.*, 
      (SELECT COUNT(*) FROM daily_challenge_questions WHERE challenge_id = dc.id AND enabled = true) AS question_count
    FROM daily_challenges dc
    WHERE dc.is_active = true
    ORDER BY dc.created_at DESC
    LIMIT 5
  `;

  if (!rows.length) return Response.json({ challenge: null, challenges: [], questions: [] });

  // Keep backward-compat: first challenge + questions for single-challenge consumers
  const firstChallenge = rows[0];
  const questions = await sql`
    SELECT id, question, options, correct_index, reason, enabled
    FROM daily_challenge_questions
    WHERE challenge_id = ${firstChallenge.id} AND enabled = true
    ORDER BY id ASC
  `;

  return Response.json({ challenge: firstChallenge, challenges: rows, questions });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, description, quiz_duration, total_questions, shuffle_questions, is_active } = body;

  if (!title?.trim()) return Response.json({ error: 'Title required' }, { status: 400 });

  const rows = await sql`
    INSERT INTO daily_challenges (title, description, quiz_duration, total_questions, shuffle_questions, is_active)
    VALUES (${title.trim()}, ${description ?? ''}, ${quiz_duration ?? 30}, ${total_questions ?? 5}, ${shuffle_questions ?? true}, ${is_active ?? true})
    RETURNING *
  `;
  return Response.json({ challenge: rows[0] });
}
