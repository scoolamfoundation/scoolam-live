import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { content_type: string; content_id: number };
  const { content_type, content_id } = body;

  if (!content_type || !content_id) {
    return Response.json({ error: 'content_type and content_id required' }, { status: 400 });
  }

  const today = new Date().toISOString().split('T')[0];

  // Get limits
  const settingRows = await sql`SELECT value FROM app_settings WHERE key = 'free_limits'`;
  const limits = (settingRows[0]?.value as Record<string, number>) ?? {
    videos_per_day: 2,
    infographics_per_day: 3,
    worksheets_per_day: 2,
  };

  // Check daily usage for this type
  const limitKey = `${content_type}s_per_day`;
  const limit = limits[limitKey] ?? 999;

  const usageRows = await sql`
    SELECT COUNT(*)::int as cnt FROM content_access_log
    WHERE user_id = ${session.user.id} AND content_type = ${content_type} AND accessed_date = ${today}
  `;
  const used = Number(usageRows[0]?.cnt ?? 0);

  if (used >= limit) {
    return Response.json(
      { allowed: false, limit, used, message: 'Daily limit reached' },
      { status: 403 }
    );
  }

  // Log access
  await sql`
    INSERT INTO content_access_log (user_id, content_type, content_id, accessed_date)
    VALUES (${session.user.id}, ${content_type}, ${content_id}, ${today})
    ON CONFLICT DO NOTHING
  `;

  return Response.json({ allowed: true, limit, used: used + 1 });
}
