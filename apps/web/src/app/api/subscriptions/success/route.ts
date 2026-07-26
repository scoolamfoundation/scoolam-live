import sql from '@/app/api/utils/sql';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan_id');

  if (!userId || !sessionId) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    await sql`
      UPDATE "user" 
      SET is_premium = true, "updatedAt" = now() 
      WHERE id = ${userId}
    `;

    // Get plan details for notification
    const userRows = await sql`SELECT name, email FROM "user" WHERE id = ${userId}`;
    const user = userRows[0];
    let planName = 'Subscription';
    let planAmount = 0;

    if (planId) {
      const planRows = await sql`SELECT name, price FROM subscription_plans WHERE id = ${planId}`;
      if (planRows[0]) {
        planName = planRows[0].name as string;
        planAmount = Number(planRows[0].price);
      }
    }

    // Update the purchase_attempt notification to purchase_success
    await sql`
      UPDATE admin_notifications
      SET event_type = 'purchase_success', status = 'unread'
      WHERE user_id = ${userId}
        AND event_type = 'purchase_attempt'
        AND created_at > NOW() - INTERVAL '1 hour'
    `;

    // Insert a final success notification
    await sql`
      INSERT INTO admin_notifications (user_id, user_name, user_email, event_type, plan_name, plan_id, amount, platform)
      VALUES (
        ${userId},
        ${user?.name ?? ''},
        ${user?.email ?? ''},
        'purchase_success',
        ${planName},
        ${planId ? Number(planId) : null},
        ${planAmount},
        'web'
      )
    `;

    // Check referral on_purchase rule
    try {
      const configRows = await sql`SELECT value FROM app_settings WHERE key = 'referral_config'`;
      const config = configRows[0]?.value as Record<string, unknown> | null;
      const rules =
        (config as { reward_rules?: { id: string; enabled: boolean }[] } | null)?.reward_rules ??
        [];
      const onPurchaseRule = rules.find(
        (r: { id: string; enabled: boolean }) => r.id === 'on_purchase'
      );

      if (onPurchaseRule?.enabled) {
        const rewardAmount = Number(
          (config as { wallet_amount_per_invite?: number } | null)?.wallet_amount_per_invite ?? 50
        );
        const referralRows = await sql`
          SELECT referrer_user_id FROM referrals
          WHERE referred_user_id = ${userId} AND status = 'pending'
          LIMIT 1
        `;
        if (referralRows[0]) {
          const referrerId = referralRows[0].referrer_user_id as string;
          await sql`
            UPDATE "user" SET wallet_balance = COALESCE(wallet_balance, 0) + ${rewardAmount} WHERE id = ${referrerId}
          `;
          await sql`
            INSERT INTO wallet_transactions (user_id, amount, type, reason, reference_id)
            VALUES (${referrerId}, ${rewardAmount}, 'credit', 'Referral reward - referee purchased subscription', ${userId})
          `;
          await sql`
            UPDATE referrals SET status = 'rewarded' WHERE referred_user_id = ${userId}
          `;
        }
      }
    } catch (e) {
      console.error('Referral reward check failed:', e);
    }
  } catch (err) {
    console.error('Failed to update user premium status:', err);
  }

  return redirect('/subscription-success');
}
