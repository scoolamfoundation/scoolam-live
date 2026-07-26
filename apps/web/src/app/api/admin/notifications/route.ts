import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') ?? 'all';

  let rows;
  if (type === 'unread') {
    rows = await sql`
      SELECT * FROM admin_notifications WHERE status = 'unread' ORDER BY created_at DESC LIMIT 100
    `;
  } else {
    rows = await sql`
      SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 200
    `;
  }

  const [unreadNotifs, unreadReports] = await Promise.all([
    sql`SELECT COUNT(*) as cnt FROM admin_notifications WHERE status = 'unread'`,
    sql`SELECT COUNT(*) as cnt FROM issue_reports WHERE is_read = FALSE`,
  ]);

  const unreadCount = Number(unreadNotifs[0]?.cnt ?? 0);
  const unreadReportCount = Number(unreadReports[0]?.cnt ?? 0);

  return Response.json({
    notifications: rows,
    unread_count: unreadCount + unreadReportCount,
    purchase_unread: unreadCount,
    reports_unread: unreadReportCount,
  });
}

export async function PATCH(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = (await request.json()) as { id?: number; mark_all_read?: boolean };

  if (body.mark_all_read) {
    await sql`UPDATE admin_notifications SET status = 'read' WHERE status = 'unread'`;
    return Response.json({ success: true });
  }

  if (body.id) {
    await sql`UPDATE admin_notifications SET status = 'read' WHERE id = ${body.id}`;
    return Response.json({ success: true });
  }

  return Response.json({ error: 'Invalid request' }, { status: 400 });
}
