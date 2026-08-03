import sql from '@/app/api/utils/sql';

export async function GET() {
  // Check if subscriptions are globally enabled
  const settingRows = await sql`SELECT value FROM app_settings WHERE key = 'subscriptions_enabled'`;
  const subscriptionsEnabled: boolean =
    settingRows.length === 0
      ? true
      : (settingRows[0].value as { enabled: boolean })?.enabled !== false;

  let plans;
  if (subscriptionsEnabled) {
    plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order ASC`;
  } else {
    // Only return free plans (price = 0) when subscriptions are disabled
    plans = await sql`SELECT * FROM subscription_plans WHERE price = 0 ORDER BY sort_order ASC`;
  }

  return Response.json({ plans, subscriptions_enabled: subscriptionsEnabled });
}
