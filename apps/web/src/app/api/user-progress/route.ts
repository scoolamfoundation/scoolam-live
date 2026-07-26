import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure row exists
  await sql`
    INSERT INTO user_progress (user_id) VALUES (${session.user.id})
    ON CONFLICT (user_id) DO NOTHING
  `;

  const rows = await sql`
    SELECT videos_watched, mcqs_answered, current_rank, streak_days, last_activity
    FROM user_progress WHERE user_id = ${session.user.id}
  `;
  return Response.json({
    progress: rows[0] ?? { videos_watched: 0, mcqs_answered: 0, current_rank: 999, streak_days: 0 },
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { videos_watched, mcqs_answered, current_rank, streak_days } = body;

  // Upsert
  await sql`
    INSERT INTO user_progress (user_id, videos_watched, mcqs_answered, current_rank, streak_days, last_activity)
    VALUES (${session.user.id}, ${videos_watched ?? 0}, ${mcqs_answered ?? 0}, ${current_rank ?? 999}, ${streak_days ?? 0}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      videos_watched = EXCLUDED.videos_watched,
      mcqs_answered = EXCLUDED.mcqs_answered,
      current_rank = EXCLUDED.current_rank,
      streak_days = EXCLUDED.streak_days,
      last_activity = NOW()
  `;

  const rows = await sql`SELECT * FROM user_progress WHERE user_id = ${session.user.id}`;
  return Response.json({ progress: rows[0] });
}
