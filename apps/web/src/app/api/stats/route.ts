import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const uid = session.user.id;

  const [
    totalVideosRows,
    correctAnswersRows,
    rankRows,
    videosWatchedRows,
    topicsAttemptedRows,
    streakRows,
  ] = await sql.transaction([
    // Total videos in system
    sql`SELECT COUNT(*) AS count FROM topics WHERE video_url IS NOT NULL AND video_url != ''`,

    // Total correct answers (topics + daily challenges combined)
    sql`SELECT COALESCE(SUM(score), 0) AS total_correct FROM quiz_attempts WHERE user_id = ${uid}`,

    // Rank: count users with more correct answers
    sql`
      SELECT COUNT(*) + 1 AS rank_position
      FROM (
        SELECT user_id, SUM(score) AS total_correct
        FROM quiz_attempts
        GROUP BY user_id
        HAVING SUM(score) > (
          SELECT COALESCE(SUM(score), 0) FROM quiz_attempts WHERE user_id = ${uid}
        )
      ) better_users
    `,

    // Videos watched by this user
    sql`SELECT COUNT(*) AS count FROM video_watches WHERE user_id = ${uid}`,

    // MCQs Done: distinct topics + distinct challenges attempted
    sql`
      SELECT (
        COUNT(DISTINCT topic_id) FILTER (WHERE topic_id IS NOT NULL) +
        COUNT(DISTINCT challenge_id) FILTER (WHERE challenge_id IS NOT NULL)
      ) AS count
      FROM quiz_attempts WHERE user_id = ${uid}
    `,

    // Streak
    sql`SELECT streak_days, last_activity_date FROM user_progress WHERE user_id = ${uid}`,
  ]);

  const totalVideos = Number(totalVideosRows[0]?.count ?? 0);
  const totalCorrect = Number(correctAnswersRows[0]?.total_correct ?? 0);
  const rankPosition = Number(rankRows[0]?.rank_position ?? 1);
  const videosWatched = Number(videosWatchedRows[0]?.count ?? 0);
  const topicsAttempted = Number(topicsAttemptedRows[0]?.count ?? 0);

  let streakDays = Number(streakRows[0]?.streak_days ?? 0);
  const lastDate = streakRows[0]?.last_activity_date as string | null;
  if (lastDate) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate < yesterday) {
      streakDays = 0;
      await sql`UPDATE user_progress SET streak_days = 0 WHERE user_id = ${uid}`;
    }
  }

  const badge =
    rankPosition === 1
      ? 'gold'
      : rankPosition === 2
        ? 'silver'
        : rankPosition === 3
          ? 'bronze'
          : null;

  return Response.json({
    total_videos: totalVideos,
    total_correct: totalCorrect,
    rank: rankPosition,
    rank_badge: badge,
    videos_watched: videosWatched,
    topics_attempted: topicsAttempted,
    streak_days: streakDays,
  });
}
