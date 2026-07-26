import sql from '@/app/api/utils/sql';
import { requireAdmin } from '@/app/api/utils/requireAdmin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Public — mobile app reads this
  const { id } = await params;

  const [topics, questions] = await sql.transaction([
    sql`SELECT * FROM topics WHERE id = ${id}`,
    sql`SELECT * FROM questions WHERE topic_id = ${id} ORDER BY id ASC`,
  ]);

  if (topics.length === 0) {
    return Response.json({ error: 'Topic not found' }, { status: 404 });
  }

  return Response.json({ topic: topics[0], questions });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  const body = await request.json();
  const {
    title,
    category,
    description,
    video_url,
    video_orientation,
    key_takeaways,
    quiz_duration,
    total_questions,
    shuffle_questions,
    thumbnail_url,
    is_premium,
  } = body;

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(title);
  }
  if (category !== undefined) {
    setClauses.push(`category = $${idx++}`);
    values.push(category);
  }
  if (description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(description);
  }
  if (video_url !== undefined) {
    setClauses.push(`video_url = $${idx++}`);
    values.push(video_url);
  }
  if (video_orientation !== undefined) {
    setClauses.push(`video_orientation = $${idx++}`);
    values.push(video_orientation);
  }
  if (key_takeaways !== undefined) {
    setClauses.push(`key_takeaways = $${idx++}`);
    values.push(key_takeaways);
  }
  if (quiz_duration !== undefined) {
    setClauses.push(`quiz_duration = $${idx++}`);
    values.push(quiz_duration);
  }
  if (total_questions !== undefined) {
    setClauses.push(`total_questions = $${idx++}`);
    values.push(total_questions);
  }
  if (shuffle_questions !== undefined) {
    setClauses.push(`shuffle_questions = $${idx++}`);
    values.push(shuffle_questions);
  }
  if (thumbnail_url !== undefined) {
    setClauses.push(`thumbnail_url = $${idx++}`);
    values.push(thumbnail_url);
  }
  if (is_premium !== undefined) {
    setClauses.push(`is_premium = $${idx++}`);
    values.push(is_premium);
  }

  if (setClauses.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const result = await sql(
    `UPDATE topics SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  if (result.length === 0) {
    return Response.json({ error: 'Topic not found' }, { status: 404 });
  }
  return Response.json({ topic: result[0] });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  await sql`DELETE FROM questions WHERE topic_id = ${id}`;
  await sql`DELETE FROM topics WHERE id = ${id}`;
  return Response.json({ success: true });
}
