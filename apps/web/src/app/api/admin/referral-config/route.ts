import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

const DEFAULT_CONFIG = {
  wallet_amount_per_invite: 50,
  currency: 'INR',
  reward_rules: [
    { id: 'on_signup', label: 'Upon referee signup via referral code/link', enabled: true },
    { id: 'on_purchase', label: 'Upon referee purchases any subscription', enabled: false },
    { id: 'after_30_days', label: '30 days after referee joins', enabled: false },
  ],
  minimum_redeem_amount: 100,
  max_wallet_balance: 1000,
};

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const rows = await sql`SELECT value FROM app_settings WHERE key = 'referral_config'`;
  const config = rows[0]?.value ?? DEFAULT_CONFIG;
  return Response.json({ config });
}

export async function PATCH(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = (await request.json()) as Record<string, unknown>;

  await sql`
    INSERT INTO app_settings (key, value)
    VALUES ('referral_config', ${JSON.stringify(body)})
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(body)}, updated_at = NOW()
  `;

  return Response.json({ success: true, config: body });
}
