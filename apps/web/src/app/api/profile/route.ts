import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`
    SELECT id, name, email, phone, state, country, favourite_subjects, is_active, is_premium, "createdAt"
    FROM "user" WHERE id = ${session.user.id}
  `;
  if (!rows[0]) return Response.json({ error: 'User not found' }, { status: 404 });
  return Response.json({ user: rows[0] });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, phone, state, country, favourite_subjects } = body;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined) {
    if (!String(name).trim())
      return Response.json({ error: 'Name cannot be empty' }, { status: 400 });
    setClauses.push(`name = $${idx++}`);
    values.push(String(name).trim());
  }
  if (phone !== undefined) {
    setClauses.push(`phone = $${idx++}`);
    values.push(phone);
  }
  if (state !== undefined) {
    setClauses.push(`state = $${idx++}`);
    values.push(state);
  }
  if (country !== undefined) {
    setClauses.push(`country = $${idx++}`);
    values.push(country);
  }
  if (favourite_subjects !== undefined) {
    const arr = Array.isArray(favourite_subjects) ? favourite_subjects : [];
    const pgArray =
      '{' +
      arr
        .map((s: string) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
        .join(',') +
      '}';
    // ::text[] cast is required — without it the Neon HTTP driver passes the
    // array literal as a plain text parameter and PostgreSQL won't auto-cast.
    setClauses.push(`favourite_subjects = $${idx++}::text[]`);
    values.push(pgArray);
  }

  if (!setClauses.length) return Response.json({ error: 'No fields to update' }, { status: 400 });

  setClauses.push(`"updatedAt" = NOW()`);
  values.push(session.user.id);

  try {
    const result = await sql(
      `UPDATE "user" SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, name, email, phone, state, country, favourite_subjects, is_active`,
      values
    );
    return Response.json({ user: result[0] });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Soft delete — marks account inactive, data is preserved
  await sql`UPDATE "user" SET is_active = false, "updatedAt" = NOW() WHERE id = ${session.user.id}`;
  return Response.json({ success: true });
}
