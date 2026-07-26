import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET() {
  // Public — mobile app reads this
  const topics = await sql`
    SELECT * FROM topics ORDER BY id DESC
  `;
  return Response.json({ topics });
}

export async function POST(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await request.json();
  const {
    title,
    category,
    description = '',
    video_url = '',
    video_orientation = 'horizontal',
    key_takeaways = [],
    quiz_duration = 30,
    total_questions = 5,
    shuffle_questions = true,
    thumbnail_url = '',
    is_premium = false,
  } = body;

  if (!title || !category) {
    return Response.json({ error: 'Title and category are required' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO topics (title, category, description, video_url, video_orientation, key_takeaways, quiz_duration, total_questions, shuffle_questions, thumbnail_url, is_premium)
    VALUES (${title}, ${category}, ${description}, ${video_url}, ${video_orientation}, ${key_takeaways}, ${quiz_duration}, ${total_questions}, ${shuffle_questions}, ${thumbnail_url}, ${is_premium})
    RETURNING *
  `;
  return Response.json({ topic: result[0] }, { status: 201 });
}
