import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const rows = await sql`SELECT key, value FROM app_settings`;
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    settings[row.key as string] = row.value;
  }
  return Response.json({ settings });
}

export async function PATCH(request: Request) {
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck;

  const body = (await request.json()) as { key: string; value: unknown };
  const { key, value } = body;
  if (!key) return Response.json({ error: 'key required' }, { status: 400 });

  await sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  return Response.json({ success: true });
}
