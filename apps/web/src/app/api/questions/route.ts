import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topic_id');

  if (!topicId) {
    return Response.json({ error: 'topic_id is required' }, { status: 400 });
  }

  const questions = await sql`
    SELECT * FROM questions WHERE topic_id = ${topicId} ORDER BY id ASC
  `;
  return Response.json({ questions });
}

export async function POST(request: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await request.json();
  const { topic_id, question, options, correct_index, reason = '', enabled = true } = body;

  if (!topic_id || !question || !options || correct_index === undefined) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO questions (topic_id, question, options, correct_index, reason, enabled)
    VALUES (${topic_id}, ${question}, ${JSON.stringify(options)}, ${correct_index}, ${reason}, ${enabled})
    RETURNING *
  `;
  return Response.json({ question: result[0] }, { status: 201 });
}
