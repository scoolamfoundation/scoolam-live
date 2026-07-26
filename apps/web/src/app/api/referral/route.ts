import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function generateCode(userId: string): string {
  // Simple 8-char alphanumeric code based on user id
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  // Use last 6 chars of userId + 2 random
  const seed = userId.replace(/-/g, '').slice(-6).toUpperCase();
  for (let i = 0; i < seed.length && i < 6; i++) {
    const idx = seed.charCodeAt(i) % chars.length;
    code += chars[idx];
  }
  while (code.length < 8) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code.slice(0, 8);
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Get or create referral code
  let codeRows = await sql`SELECT code FROM referral_codes WHERE user_id = ${userId}`;
  if (codeRows.length === 0) {
    let code = generateCode(userId);
    // Ensure uniqueness
    let attempt = 0;
    while (attempt < 5) {
      const exists = await sql`SELECT id FROM referral_codes WHERE code = ${code}`;
      if (exists.length === 0) break;
      code = generateCode(userId + attempt);
      attempt++;
    }
    await sql`INSERT INTO referral_codes (user_id, code) VALUES (${userId}, ${code}) ON CONFLICT (user_id) DO NOTHING`;
    codeRows = await sql`SELECT code FROM referral_codes WHERE user_id = ${userId}`;
  }

  const code = codeRows[0]?.code ?? '';

  // Get wallet balance
  const userRows = await sql`SELECT wallet_balance FROM "user" WHERE id = ${userId}`;
  const walletBalance = Number(userRows[0]?.wallet_balance ?? 0);

  // Get referral stats
  const referralStats = await sql`
    SELECT COUNT(*) as total,
           COUNT(CASE WHEN status = 'rewarded' THEN 1 END) as rewarded
    FROM referrals WHERE referrer_user_id = ${userId}
  `;

  // Get referral config for reward amount
  const configRows = await sql`SELECT value FROM app_settings WHERE key = 'referral_config'`;
  const config = configRows[0]?.value as Record<string, unknown> | null;
  const rewardAmount = Number(
    (config as { wallet_amount_per_invite?: number } | null)?.wallet_amount_per_invite ?? 50
  );

  const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL ?? '';
  const referralLink = `${baseUrl}?ref=${code}`;

  return Response.json({
    code,
    referral_link: referralLink,
    wallet_balance: walletBalance,
    reward_amount: rewardAmount,
    total_referrals: Number(referralStats[0]?.total ?? 0),
    rewarded_referrals: Number(referralStats[0]?.rewarded ?? 0),
  });
}
