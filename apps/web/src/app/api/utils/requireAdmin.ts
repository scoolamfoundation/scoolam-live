import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from './sql';

/**
 * Checks that the request comes from a signed-in admin user.
 * Returns null if authorised, or a 401/403 Response if not.
 *
 * Usage in a route handler:
 *   const deny = await requireAdmin();
 *   if (deny) return deny;
 */
export async function requireAdmin(): Promise<Response | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await sql`
    SELECT is_admin FROM "user" WHERE id = ${session.user.id}
  `;

  if (!rows[0]?.is_admin) {
    return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
  }

  return null; // authorised
}
