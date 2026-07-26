import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ is_premium: false, authenticated: false });
    }

    const rows = await sql`
      SELECT is_premium FROM "user" WHERE id = ${session.user.id}
    `;
    const is_premium = rows[0]?.is_premium ?? false;

    return Response.json({ is_premium, authenticated: true });
  } catch {
    return Response.json({ is_premium: false, authenticated: false });
  }
}
