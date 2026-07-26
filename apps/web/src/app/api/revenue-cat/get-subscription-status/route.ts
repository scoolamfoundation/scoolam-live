import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const apiKey = process.env.REVENUE_CAT_API_KEY;
    const projectId = process.env.REVENUE_CAT_PROJECT_ID;

    // If RevenueCat is not configured, fall back to DB is_premium flag
    if (!apiKey || !projectId) {
      const rows = await sql`SELECT is_premium FROM "user" WHERE id = ${userId}`;
      const hasAccess = rows[0]?.is_premium === true;
      return Response.json({ hasAccess });
    }

    // Check cache: only re-verify every 5 minutes
    const cached = await sql`
      SELECT is_premium, last_rc_check_at FROM "user" WHERE id = ${userId}
    `;
    const row = cached[0];
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const stale = !row?.last_rc_check_at || new Date(row.last_rc_check_at) < fiveMinAgo;

    if (!stale && row) {
      return Response.json({ hasAccess: row.is_premium === true });
    }

    // Verify with RevenueCat REST API
    try {
      const rcRes = await fetch(
        `https://api.revenuecat.com/v2/projects/${projectId}/customers/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (rcRes.ok) {
        const data = await rcRes.json();
        const active = data.active_entitlements?.items ?? [];
        const hasAccess = active.length > 0;

        await sql`
          UPDATE "user"
          SET is_premium = ${hasAccess}, last_rc_check_at = NOW()
          WHERE id = ${userId}
        `;

        return Response.json({ hasAccess });
      } else if (rcRes.status === 404) {
        // Customer not found in RevenueCat — no subscription
        await sql`
          UPDATE "user"
          SET is_premium = false, last_rc_check_at = NOW()
          WHERE id = ${userId}
        `;
        return Response.json({ hasAccess: false });
      } else {
        // RevenueCat error — fall back to cached DB value
        return Response.json({ hasAccess: row?.is_premium === true });
      }
    } catch (fetchErr) {
      console.error('RevenueCat API call failed:', fetchErr);
      return Response.json({ hasAccess: row?.is_premium === true });
    }
  } catch (err) {
    console.error('get-subscription-status error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
