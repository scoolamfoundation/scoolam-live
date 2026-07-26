import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;
  const rows = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return Response.json({ categories: rows });
}

export async function POST(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { name } = await request.json();
  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO categories (name) VALUES (${name.trim()}) RETURNING *
    `;
    return Response.json({ category: result[0] }, { status: 201 });
  } catch {
    return Response.json({ error: 'Category already exists' }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await request.json();
  await sql`DELETE FROM categories WHERE id = ${id}`;
  return Response.json({ success: true });
}
