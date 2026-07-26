import sql from '@/app/api/utils/sql';

export async function GET() {
  const rows = await sql`
    SELECT id, title, content, sort_order
    FROM help_topics
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, created_at ASC
  `;
  return Response.json({ topics: rows });
}
