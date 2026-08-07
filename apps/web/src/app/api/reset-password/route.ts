import argon2 from 'argon2';
import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  try {
    const { token, password } = (await request.json()) as {
      token?: string;
      password?: string;
    };

    if (!token || !password) {
      return Response.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Find valid, unexpired, unused token
    const tokens = await sql`
      SELECT prt.id, prt.user_id
      FROM password_reset_tokens prt
      WHERE prt.token = ${token}
        AND prt.used = false
        AND prt.expires_at > NOW()
      LIMIT 1
    `;

    if (tokens.length === 0) {
      return Response.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const { id: tokenId, user_id: userId } = tokens[0] as { id: number; user_id: string };

    // Hash the new password with argon2
    const hashedPassword = await argon2.hash(password);

    // Update password and mark token as used atomically
    await sql.transaction([
      sql`
        UPDATE account
        SET password = ${hashedPassword}
        WHERE "userId" = ${userId} AND "providerId" = 'credential'
      `,
      sql`
        UPDATE password_reset_tokens
        SET used = true
        WHERE id = ${tokenId}
      `,
    ]);

    return Response.json({ success: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
