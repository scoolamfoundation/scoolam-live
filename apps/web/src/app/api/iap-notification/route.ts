import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    event_type: string;
    plan_name?: string;
    amount?: number;
    platform?: string;
  };

  try {
    await sql`
      INSERT INTO admin_notifications (
        user_id, user_name, user_email,
        event_type, plan_name, amount, platform
      ) VALUES (
        ${session.user.id},
        ${session.user.name ?? ''},
        ${session.user.email ?? ''},
        ${body.event_type ?? 'purchase_attempt'},
        ${body.plan_name ?? 'IAP'},
        ${body.amount ?? 0},
        ${body.platform ?? 'mobile'}
      )
    `;
  } catch (e) {
    console.error('Failed to log IAP notification:', e);
  }

  return Response.json({ success: true });
}
