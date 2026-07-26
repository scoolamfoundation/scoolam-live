import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const items = await sql`SELECT * FROM worksheets ORDER BY id DESC`;
  return Response.json({ worksheets: items });
}

export async function POST(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await request.json();
  const { title, description = '', file_url = '', is_premium = false } = body;

  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });

  const result = await sql`
    INSERT INTO worksheets (title, description, file_url, is_premium)
    VALUES (${title}, ${description}, ${file_url}, ${is_premium})
    RETURNING *
  `;
  return Response.json({ worksheet: result[0] }, { status: 201 });
}
