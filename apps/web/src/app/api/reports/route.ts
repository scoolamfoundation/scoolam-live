import sql from '@/app/api/utils/sql';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { subject: string; description: string };

  if (!body.subject?.trim() || !body.description?.trim()) {
    return Response.json({ error: 'Subject and description are required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO issue_reports (user_id, user_name, user_email, subject, description)
    VALUES (
      ${session.user.id},
      ${session.user.name ?? ''},
      ${session.user.email ?? ''},
      ${body.subject.trim()},
      ${body.description.trim()}
    )
    RETURNING id
  `;

  return Response.json({ success: true, report_id: rows[0]?.id });
}
