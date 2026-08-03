import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import sql from '@/app/api/utils/sql';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ notifications: [] });

  const uid = session.user.id;

  // Run all queries in parallel
  const [newTopicsRows, helpTicketRows, pendingQuizRows, dailyChallengeRows] = await Promise.all([
    // New topics added in the last 7 days
    sql`
      SELECT id, title, category, created_at
      FROM topics
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `,

    // User's help tickets where admin has changed status (not 'open')
    sql`
      SELECT id, subject, status, created_at
      FROM issue_reports
      WHERE user_id = ${uid}
        AND status != 'open'
      ORDER BY created_at DESC
      LIMIT 10
    `,

    // Topics user watched video for but never took quiz (pending learning)
    sql`
      SELECT t.id, t.title, t.category, vw.watched_at
      FROM video_watches vw
      JOIN topics t ON t.id = vw.topic_id
      WHERE vw.user_id = ${uid}
        AND vw.watched_at >= NOW() - INTERVAL '2 days'
        AND NOT EXISTS (
          SELECT 1 FROM quiz_attempts qa
          WHERE qa.user_id = ${uid} AND qa.topic_id = vw.topic_id
        )
      ORDER BY vw.watched_at DESC
      LIMIT 5
    `,

    // Active daily challenges
    sql`
      SELECT id, title FROM daily_challenges
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 3
    `,
  ]);

  const notifications: {
    id: string;
    type: 'new_topic' | 'ticket_updated' | 'pending_quiz' | 'daily_challenge';
    title: string;
    body: string;
    created_at: string;
    data?: Record<string, unknown>;
  }[] = [];

  // New topics
  for (const t of newTopicsRows) {
    notifications.push({
      id: `topic_${t.id}`,
      type: 'new_topic',
      title: 'New Topic Available',
      body: `"${t.title}" has been added${t.category ? ` in ${t.category}` : ''}. Start learning now!`,
      created_at: String(t.created_at),
      data: { topic_id: t.id },
    });
  }

  // Ticket status updates
  for (const ticket of helpTicketRows) {
    const statusLabel =
      ticket.status === 'resolved'
        ? 'resolved'
        : ticket.status === 'in_progress'
          ? 'being reviewed'
          : ticket.status;
    notifications.push({
      id: `ticket_${ticket.id}`,
      type: 'ticket_updated',
      title: 'Support Ticket Updated',
      body: `Your report "${ticket.subject}" has been ${statusLabel} by the team.`,
      created_at: String(ticket.created_at),
      data: { ticket_id: ticket.id },
    });
  }

  // Pending quizzes (watched video but didn't do quiz)
  for (const t of pendingQuizRows) {
    notifications.push({
      id: `pending_quiz_${t.id}`,
      type: 'pending_quiz',
      title: 'Complete Your Quiz',
      body: `You watched "${t.title}" but haven't taken the quiz yet. Test your knowledge!`,
      created_at: String(t.watched_at),
      data: { topic_id: t.id },
    });
  }

  // Daily challenges
  for (const c of dailyChallengeRows) {
    notifications.push({
      id: `challenge_${c.id}`,
      type: 'daily_challenge',
      title: 'Daily Challenge Ready',
      body: `"${c.title}" — Test yourself with today's challenge!`,
      created_at: new Date().toISOString(),
      data: { challenge_id: c.id },
    });
  }

  // Sort by newest first
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return Response.json({ notifications });
}
