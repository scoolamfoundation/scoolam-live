import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const settingRows = await sql`SELECT value FROM app_settings WHERE key = 'free_limits'`;
  const limits = (settingRows[0]?.value as Record<string, number>) ?? {
    videos_per_day: 2,
    mcqs_per_day: 5,
    infographics_per_day: 3,
    worksheets_per_day: 2,
  };

  // Ensure mcqs_per_day exists even if not yet in DB settings
  if (limits.mcqs_per_day === undefined) {
    limits.mcqs_per_day = 5;
  }

  let usage = { videos: 0, mcqs: 0, infographics: 0, worksheets: 0 };

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      const userId = session.user.id;
      const today = new Date().toISOString().split('T')[0];

      const [videoRows, mcqRows, infraRows, worksheetRows] = await sql.transaction([
        sql`SELECT COUNT(*)::int as cnt FROM video_watches WHERE user_id = ${userId} AND DATE(watched_at) = ${today}`,
        sql`SELECT COUNT(*)::int as cnt FROM quiz_attempts WHERE user_id = ${userId} AND DATE(attempted_at) = ${today}`,
        sql`SELECT COUNT(*)::int as cnt FROM content_access_log WHERE user_id = ${userId} AND content_type = 'infographic' AND accessed_date = ${today}`,
        sql`SELECT COUNT(*)::int as cnt FROM content_access_log WHERE user_id = ${userId} AND content_type = 'worksheet' AND accessed_date = ${today}`,
      ]);

      usage = {
        videos: Number(videoRows[0]?.cnt ?? 0),
        mcqs: Number(mcqRows[0]?.cnt ?? 0),
        infographics: Number(infraRows[0]?.cnt ?? 0),
        worksheets: Number(worksheetRows[0]?.cnt ?? 0),
      };
    }
  } catch {
    // not authenticated — return limits with zero usage
  }

  return Response.json({ limits, usage });
}
