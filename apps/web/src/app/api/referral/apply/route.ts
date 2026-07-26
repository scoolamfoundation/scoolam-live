import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const body = (await request.json()) as { code: string };
  const code = body.code?.trim().toUpperCase();

  if (!code) return Response.json({ error: 'Referral code is required' }, { status: 400 });

  // Check if user already used a referral code
  const alreadyReferred = await sql`SELECT id FROM referrals WHERE referred_user_id = ${userId}`;
  if (alreadyReferred.length > 0) {
    return Response.json({ error: 'You have already used a referral code.' }, { status: 400 });
  }

  // Find the referral code
  const codeRows = await sql`SELECT user_id FROM referral_codes WHERE code = ${code}`;
  if (codeRows.length === 0) {
    return Response.json({ error: 'Invalid referral code.' }, { status: 400 });
  }

  const referrerUserId = codeRows[0]?.user_id as string;

  // Can't refer yourself
  if (referrerUserId === userId) {
    return Response.json({ error: 'You cannot use your own referral code.' }, { status: 400 });
  }

  // Get reward config
  const configRows = await sql`SELECT value FROM app_settings WHERE key = 'referral_config'`;
  const config = configRows[0]?.value as Record<string, unknown> | null;
  const rewardAmount = Number(
    (config as { wallet_amount_per_invite?: number } | null)?.wallet_amount_per_invite ?? 50
  );

  // Check if "on_signup" rule is enabled
  const rules =
    (config as { reward_rules?: { id: string; enabled: boolean }[] } | null)?.reward_rules ?? [];
  const onSignupRule = rules.find((r: { id: string; enabled: boolean }) => r.id === 'on_signup');
  const giveImmediately = !onSignupRule || onSignupRule.enabled;

  // Record the referral
  await sql`
    INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status)
    VALUES (${referrerUserId}, ${userId}, ${code}, ${giveImmediately ? 'rewarded' : 'pending'})
    ON CONFLICT (referred_user_id) DO NOTHING
  `;

  // If on_signup rule is enabled, credit wallet immediately
  if (giveImmediately) {
    await sql`
      UPDATE "user" SET wallet_balance = COALESCE(wallet_balance, 0) + ${rewardAmount}
      WHERE id = ${referrerUserId}
    `;
    await sql`
      INSERT INTO wallet_transactions (user_id, amount, type, reason, reference_id)
      VALUES (${referrerUserId}, ${rewardAmount}, 'credit', 'Referral reward - new user joined', ${userId})
    `;
  }

  return Response.json({
    success: true,
    reward_given: giveImmediately,
    reward_amount: giveImmediately ? rewardAmount : 0,
    message: giveImmediately
      ? `Referral code applied! Your friend earned a wallet reward.`
      : `Referral code applied! Reward will be given based on configured rules.`,
  });
}
