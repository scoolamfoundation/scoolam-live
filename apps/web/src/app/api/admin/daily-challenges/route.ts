import { requireAdmin } from '@/app/api/utils/requireAdmin';
import sql from '@/app/api/utils/sql';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const rows = await sql`
    SELECT dc.*,
      (SELECT COUNT(*) FROM daily_challenge_questions WHERE challenge_id = dc.id AND enabled = true) AS question_count
    FROM daily_challenges dc
    ORDER BY dc.created_at DESC
  `;
  return Response.json({ challenges: rows });
}
