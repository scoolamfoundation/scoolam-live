import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const rows = await sql`
    SELECT * FROM help_topics ORDER BY sort_order ASC, created_at ASC
  `;
  return Response.json({ topics: rows });
}

export async function POST(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = (await request.json()) as { title: string; content: string; sort_order?: number };

  if (!body.title?.trim()) {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO help_topics (title, content, sort_order)
    VALUES (${body.title.trim()}, ${body.content ?? ''}, ${body.sort_order ?? 0})
    RETURNING *
  `;
  return Response.json({ topic: rows[0] });
}
