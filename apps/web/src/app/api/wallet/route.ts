import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const userRows = await sql`SELECT wallet_balance FROM "user" WHERE id = ${userId}`;
  const walletBalance = Number(userRows[0]?.wallet_balance ?? 0);

  const transactions = await sql`
    SELECT * FROM wallet_transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return Response.json({ wallet_balance: walletBalance, transactions });
}
