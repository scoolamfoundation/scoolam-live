import sql from '@/app/api/utils/sql';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await sql`SELECT * FROM content_pages WHERE slug = ${slug}`;
  return Response.json({ page: rows[0] ?? { slug, content: '' } });
}
