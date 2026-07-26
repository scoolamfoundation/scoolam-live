import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  try {
    const { email, otp } = (await request.json()) as { email?: string; otp?: string };

    if (!email || !otp) {
      return Response.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.trim();

    // Find matching OTP in verification table
    const rows = await sql`
      SELECT id FROM verification
      WHERE identifier = ${normalizedEmail}
        AND value = ${trimmedOtp}
        AND "expiresAt" > NOW()
      LIMIT 1
    `;

    if (rows.length === 0) {
      return Response.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }

    // Delete the used OTP
    await sql`
      DELETE FROM verification WHERE id = ${rows[0].id as string}
    `;

    // Mark user's email as verified
    await sql`
      UPDATE "user"
      SET "emailVerified" = true, "updatedAt" = NOW()
      WHERE LOWER(email) = ${normalizedEmail}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error('[verify-otp]', err);
    return Response.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
