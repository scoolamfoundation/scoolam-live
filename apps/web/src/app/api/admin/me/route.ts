import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';
import argon2 from 'argon2';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ admin: false }, { status: 401 });
  }

  const rows = await sql`
    SELECT is_admin FROM "user" WHERE id = ${session.user.id}
  `;

  if (!rows[0]?.is_admin) {
    return Response.json({ admin: false }, { status: 403 });
  }

  return Response.json({
    admin: true,
    user: { id: session.user.id, name: session.user.name, email: session.user.email },
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`SELECT is_admin FROM "user" WHERE id = ${session.user.id}`;
  if (!rows[0]?.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await request.json()) as {
    name?: string;
    current_password?: string;
    new_password?: string;
  };

  // Update name
  if (body.name && typeof body.name === 'string' && body.name.trim()) {
    await sql`
      UPDATE "user" SET name = ${body.name.trim()}, "updatedAt" = NOW()
      WHERE id = ${session.user.id}
    `;
  }

  // Update password
  if (body.new_password) {
    if (!body.current_password) {
      return Response.json({ error: 'Current password is required' }, { status: 400 });
    }
    if (body.new_password.length < 8) {
      return Response.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const accountRows = await sql`
      SELECT password FROM account
      WHERE "userId" = ${session.user.id} AND "providerId" = 'credential'
      LIMIT 1
    `;

    if (!accountRows[0]?.password) {
      return Response.json({ error: 'No password account found' }, { status: 400 });
    }

    const currentHash = accountRows[0].password as string;
    let isValid = false;
    try {
      isValid = await argon2.verify(currentHash, body.current_password);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = await argon2.hash(body.new_password);
    await sql`
      UPDATE account SET password = ${newHash}, "updatedAt" = NOW()
      WHERE "userId" = ${session.user.id} AND "providerId" = 'credential'
    `;
  }

  const updated = await sql`SELECT name, email FROM "user" WHERE id = ${session.user.id}`;
  return Response.json({ success: true, user: updated[0] });
}
