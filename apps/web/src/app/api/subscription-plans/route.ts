import sql from '@/app/api/utils/sql';

export async function GET() {
  const plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order ASC`;
  return Response.json({ plans });
}
