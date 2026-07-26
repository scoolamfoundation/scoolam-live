import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const rows = await sql`SELECT value FROM app_settings WHERE key = 'revenuecat_config'`;
  const config = rows[0]?.value ?? { entitlement_id: 'premium', offering_id: 'default' };
  return Response.json({ config });
}

export async function PATCH(request: Request) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const body = await request.json();
  const { entitlement_id, offering_id } = body as {
    entitlement_id?: string;
    offering_id?: string;
  };

  const current = await sql`SELECT value FROM app_settings WHERE key = 'revenuecat_config'`;
  const existing = current[0]?.value ?? {};

  const updated = {
    ...existing,
    ...(entitlement_id !== undefined ? { entitlement_id } : {}),
    ...(offering_id !== undefined ? { offering_id } : {}),
  };

  await sql`
    INSERT INTO app_settings (key, value)
    VALUES ('revenuecat_config', ${JSON.stringify(updated)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;

  return Response.json({ config: updated });
}
