import { randomBytes } from 'crypto';
import sql from '@/app/api/utils/sql';
import { sendEmail } from '@/app/api/utils/mailer';

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();

    // Look up the user — silently succeed even if not found to avoid
    // leaking whether an email is registered.
    const users = await sql`
      SELECT id, name FROM "user" WHERE LOWER(email) = ${normalised} LIMIT 1
    `;

    if (users.length === 0) {
      // Return success so we don't leak email existence
      return Response.json({ success: true });
    }

    const user = users[0] as { id: string; name: string };

    // Invalidate any existing unused tokens for this user
    await sql`
      UPDATE password_reset_tokens
      SET used = true
      WHERE user_id = ${user.id} AND used = false
    `;

    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      INSERT INTO password_reset_tokens (token, user_id, used, expires_at)
      VALUES (${token}, ${user.id}, false, ${expiresAt.toISOString()})
    `;

    const baseUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL ?? '';
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`;

    const html = buildResetEmailHtml({
      name: user.name ?? 'Learner',
      resetUrl,
    });

    await sendEmail({
      to: normalised,
      subject: 'Reset your Scoolam password',
      html,
    });

    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[forgot-password]', msg);
    return Response.json(
      { error: msg.includes('SMTP') ? msg : 'Could not send reset email. Please try again.' },
      { status: 500 }
    );
  }
}

function buildResetEmailHtml({ name, resetUrl }: { name: string; resetUrl: string }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your Scoolam password</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background:#0D4C3E;padding:36px 40px 28px;">
              <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.15);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:36px;">🔐</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;">Scoolam</h1>
              <p style="color:#A7C7C1;font-size:14px;margin:6px 0 0;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#374151;font-size:16px;margin:0 0 8px;font-weight:600;">Hi ${name} 👋</p>
              <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                We received a request to reset your Scoolam password.
                Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#0D4C3E;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:-0.2px;">
                  Reset My Password
                </a>
              </div>

              <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0 0 12px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color:#0D4C3E;font-size:12px;word-break:break-all;margin:0 0 24px;background:#F0FDF4;padding:12px 16px;border-radius:10px;">
                ${resetUrl}
              </p>

              <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #F3F4F6;text-align:center;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                &copy; 2026 Scoolam · Your Daily Learning App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
