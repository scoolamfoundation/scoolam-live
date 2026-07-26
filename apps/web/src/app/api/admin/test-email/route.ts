import { requireAdmin } from '@/app/api/utils/requireAdmin';
import { sendEmail } from '@/app/api/utils/mailer';

export async function POST(request: Request) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const { to } = (await request.json()) as { to?: string };

  if (!to || typeof to !== 'string') {
    return Response.json({ error: 'Recipient email is required' }, { status: 400 });
  }

  try {
    await sendEmail({
      to,
      subject: '✅ Scoolam SMTP Test — Connection Successful',
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td align="center" style="background:#0D4C3E;padding:32px 40px;">
            <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0;">Scoolam</h1>
            <p style="color:#A7C7C1;font-size:14px;margin:6px 0 0;">Your Daily Learning App</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:52px;">✅</div>
              <h2 style="color:#111827;font-size:22px;font-weight:800;margin:12px 0 4px;">SMTP Connected!</h2>
              <p style="color:#6B7280;font-size:15px;">Your email settings are working correctly.</p>
            </div>
            <div style="background:#F0FDF4;border:1px solid #A7F3D0;border-radius:14px;padding:20px;">
              <p style="color:#065F46;font-size:14px;margin:0;line-height:1.6;">
                This is a test email from your <strong>Scoolam admin panel</strong>. 
                If you received this, your SMTP configuration is working and 
                OTP verification emails will be delivered to users successfully.
              </p>
            </div>
            <p style="color:#9CA3AF;font-size:12px;margin-top:24px;text-align:center;">
              Sent from Scoolam Admin Panel · ${new Date().toLocaleString()}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `.trim(),
    });

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    console.error('[test-email]', err);
    return Response.json({ error: message }, { status: 500 });
  }
}
