import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { slug } = await params;
  const rows = await sql`SELECT * FROM content_pages WHERE slug = ${slug}`;
  return Response.json({ page: rows[0] ?? { slug, content: '' } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { slug } = await params;
  const { content } = await request.json();
  await sql`
    INSERT INTO content_pages (slug, content, updated_at)
    VALUES (${slug}, ${content ?? ''}, now())
    ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, updated_at = now()
  `;
  return Response.json({ success: true });
}
