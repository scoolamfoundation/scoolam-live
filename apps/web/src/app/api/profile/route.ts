import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await sql`
      SELECT id, name, email, phone, state, country, favourite_subjects, is_active, is_premium, "createdAt"
      FROM "user" WHERE id = ${session.user.id}
    `;
    if (!rows[0]) return Response.json({ error: 'User not found' }, { status: 404 });
    return Response.json({ user: rows[0] });
  } catch (err) {
    console.error('Profile GET error:', err);
    return Response.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, phone, state, country, favourite_subjects } = body as {
      name?: string;
      phone?: string;
      state?: string;
      country?: string;
      favourite_subjects?: string[];
    };

    if (name !== undefined && !String(name).trim()) {
      return Response.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    // Fetch current values so we can keep them if not provided
    const current = await sql`
      SELECT name, phone, state, country, favourite_subjects
      FROM "user" WHERE id = ${session.user.id}
    `;
    if (!current[0]) return Response.json({ error: 'User not found' }, { status: 404 });

    const newName = name !== undefined ? String(name).trim() : (current[0].name as string);
    const newPhone = phone !== undefined ? String(phone) : ((current[0].phone as string) ?? '');
    const newState = state !== undefined ? String(state) : ((current[0].state as string) ?? '');
    const newCountry =
      country !== undefined ? String(country) : ((current[0].country as string) ?? '');
    const newSubjects: string[] =
      favourite_subjects !== undefined
        ? Array.isArray(favourite_subjects)
          ? favourite_subjects
          : []
        : ((current[0].favourite_subjects as string[]) ?? []);

    // Convert JS array → Postgres text[] literal: {"a","b"}
    const pgSubjects =
      '{' +
      newSubjects
        .map((s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
        .join(',') +
      '}';

    const result = await sql(
      `UPDATE "user"
       SET name=$1, phone=$2, state=$3, country=$4,
           favourite_subjects=$5::text[], "updatedAt"=NOW()
       WHERE id=$6
       RETURNING id, name, email, phone, state, country, favourite_subjects, is_active`,
      [newName, newPhone, newState, newCountry, pgSubjects, session.user.id]
    );

    return Response.json({ user: result[0] });
  } catch (err) {
    console.error('Profile PATCH error:', err);
    return Response.json({ error: 'Failed to update profile. Please try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    await sql`UPDATE "user" SET is_active = false, "updatedAt" = NOW() WHERE id = ${session.user.id}`;
    return Response.json({ success: true });
  } catch (err) {
    console.error('Profile DELETE error:', err);
    return Response.json({ error: 'Failed to deactivate account' }, { status: 500 });
  }
}
