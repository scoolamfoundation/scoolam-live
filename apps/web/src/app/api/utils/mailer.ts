import nodemailer from 'nodemailer';
import sql from './sql';

interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const rows = await sql`SELECT value FROM app_settings WHERE key = 'smtp_config'`;
    return (rows[0]?.value as SmtpConfig) ?? null;
  } catch {
    return null;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string }> {
  const config = await getSmtpConfig();
  if (!config?.smtp_user || !config?.smtp_pass) {
    throw new Error('SMTP not configured. Please configure SMTP settings in the Admin panel.');
  }

  const port = Number(config.smtp_port) || 587;
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: config.smtp_host || 'smtp.gmail.com',
    port,
    secure: isSecure,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  } as Parameters<typeof nodemailer.createTransport>[0]);

  // verify connection config before attempting to send — gives a clearer error
  try {
    await transporter.verify();
  } catch (verifyErr) {
    const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
    throw new Error(
      `SMTP connection failed: ${msg}. Check your host, port, username and App Password.`
    );
  }

  let result: { messageId: string } = { messageId: '' };
  try {
    // The "from" and "replyTo" MUST match the authenticated smtp_user so Gmail
    // does not fail SPF/DKIM checks — which is the #1 cause of landing in spam.
    const info = await transporter.sendMail({
      from: `"${config.smtp_from_name || 'Scoolam'}" <${config.smtp_user}>`,
      replyTo: config.smtp_user,
      to,
      subject,
      html,
      headers: {
        'X-Mailer': 'Scoolam/1.0',
        'X-Priority': '3',
        'List-Unsubscribe': `<mailto:${config.smtp_user}?subject=unsubscribe>`,
      },
    });
    result = { messageId: (info as { messageId: string }).messageId ?? '' };
  } finally {
    transporter.close();
  }

  return result;
}

export function buildOtpEmailHtml(otp: string, recipientEmail: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Scoolam OTP</title>
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
                <span style="font-size:36px;">📚</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;">Scoolam</h1>
              <p style="color:#A7C7C1;font-size:14px;margin:6px 0 0;">Your Daily Learning App</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#374151;font-size:16px;margin:0 0 8px;font-weight:600;">Hi there 👋</p>
              <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Use the verification code below to confirm your email address
                <strong style="color:#111827;">(${recipientEmail})</strong>.
                This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#F0FDF4;border:2px dashed #A7F3D0;border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
                <p style="color:#6B7280;font-size:13px;font-weight:600;letter-spacing:1px;margin:0 0 12px;text-transform:uppercase;">Your Verification Code</p>
                <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#0D4C3E;line-height:1;font-family:monospace;">
                  ${otp}
                </div>
                <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0;">Expires in 10 minutes</p>
              </div>

              <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this code, you can safely ignore this email.
                Someone may have entered your email by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #F3F4F6;text-align:center;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                &copy; 2024 Scoolam · Your Daily Learning App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
