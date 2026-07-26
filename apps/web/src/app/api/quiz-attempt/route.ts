import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { topic_id, challenge_id, score, total } = body;

  if (score === undefined || total === undefined) {
    return Response.json({ error: 'score and total required' }, { status: 400 });
  }
  if (!topic_id && !challenge_id) {
    return Response.json({ error: 'topic_id or challenge_id required' }, { status: 400 });
  }

  const uid = session.user.id;
  const today = new Date().toISOString().slice(0, 10);

  // Insert attempt — support both topic and daily challenge
  if (topic_id) {
    await sql`
      INSERT INTO quiz_attempts (user_id, topic_id, score, total, attempted_at)
      VALUES (${uid}, ${topic_id}, ${score}, ${total}, NOW())
    `;
  } else {
    await sql`
      INSERT INTO quiz_attempts (user_id, challenge_id, score, total, attempted_at)
      VALUES (${uid}, ${challenge_id}, ${score}, ${total}, NOW())
    `;
  }

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

  const rankRows = await sql`
    SELECT COUNT(*) + 1 AS rank_position
    FROM (
      SELECT user_id, SUM(score) AS total_correct
      FROM quiz_attempts
      GROUP BY user_id
      HAVING SUM(score) > (
        SELECT COALESCE(SUM(score), 0) FROM quiz_attempts WHERE user_id = ${uid}
      )
    ) better
  `;
  const rankPosition = Number(rankRows[0]?.rank_position ?? 1);
  const badge =
    rankPosition === 1
      ? 'gold'
      : rankPosition === 2
        ? 'silver'
        : rankPosition === 3
          ? 'bronze'
          : null;

  return Response.json({ success: true, rank: rankPosition, rank_badge: badge });
}
