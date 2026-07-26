import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { topic_id } = await request.json();
  if (!topic_id) return Response.json({ error: 'topic_id required' }, { status: 400 });

  const uid = session.user.id;
  const today = new Date().toISOString().slice(0, 10);

  // Record watch (upsert — watch each topic once)
  await sql`
    INSERT INTO video_watches (user_id, topic_id, watched_at)
    VALUES (${uid}, ${topic_id}, NOW())
    ON CONFLICT (user_id, topic_id) DO UPDATE SET watched_at = NOW()
  `;

  // Update streak
  await sql`
    INSERT INTO user_progress (user_id, streak_days, last_activity_date, last_activity)
    VALUES (${uid}, 1, ${today}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      streak_days = CASE
        WHEN user_progress.last_activity_date = ${today}::date THEN user_progress.streak_days
        WHEN user_progress.last_activity_date = (${today}::date - INTERVAL '1 day')::date THEN user_progress.streak_days + 1
        ELSE 1
      END,
      last_activity_date = ${today},
      last_activity = NOW()
  `;

  return Response.json({ success: true });
}
