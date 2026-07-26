import sql from '@/app/api/utils/sql';
import { sendEmail, buildOtpEmailHtml } from '@/app/api/utils/mailer';
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate a 6-digit OTP
    const otp = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove existing OTPs for this email
    await sql`
      DELETE FROM verification
      WHERE identifier = ${normalizedEmail}
      AND value ~ '^[0-9]{6}$'
    `;

    // Store the OTP in the verification table
    const id = `otp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await sql`
      INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${normalizedEmail},
        ${otp},
        ${expiresAt.toISOString()},
        NOW(),
        NOW()
      )
    `;

    // Send OTP via email
    const html = buildOtpEmailHtml(otp, normalizedEmail);
    await sendEmail({
      to: normalizedEmail,
      subject: `${otp} is your Scoolam verification code`,
      html,
    });

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send OTP';
    console.error('[send-otp]', err);
    return Response.json({ error: message }, { status: 500 });
  }
}
