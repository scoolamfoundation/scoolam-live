'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';

function VerifyEmailForm() {
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email') ?? '';
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const source = searchParams.get('source') ?? 'email';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'loading' | 'sent' | 'verifying' | 'done' | 'skip'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentRef = useRef(false);

  useEffect(() => {
    async function init() {
      let resolvedEmail = emailParam;

      if (source === 'google' || !resolvedEmail) {
        const { data: session } = await authClient.getSession();
        if (!session?.user?.email) {
          if (typeof window !== 'undefined') window.location.href = callbackUrl;
          return;
        }

        resolvedEmail = session.user.email;
        setEmail(resolvedEmail);

        const createdAt = session.user.createdAt
          ? new Date(session.user.createdAt as unknown as string).getTime()
          : 0;
        const isNew = Date.now() - createdAt < 3 * 60 * 1000;

        if (!isNew) {
          setStep('skip');
          if (typeof window !== 'undefined') window.location.href = callbackUrl;
          return;
        }
      }

      if (!resolvedEmail) {
        if (typeof window !== 'undefined') window.location.href = callbackUrl;
        return;
      }

      if (!hasSentRef.current) {
        hasSentRef.current = true;
        await sendOtp(resolvedEmail);
      }
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendOtp(toEmail: string) {
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: toEmail }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to send OTP');
      setStep('sent');
      startResendCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
      setStep('sent');
    }
  }

  function startResendCountdown() {
    setResendCountdown(60);
  }

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const digits = otp.split('');
    digits[index] = digit;
    const newOtp = digits.join('').padEnd(6, '').slice(0, 6);
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted.padEnd(6, '').slice(0, 6));
    if (pasted.length > 0) inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const cleanOtp = otp.replace(/\s/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setStep('verifying');
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: cleanOtp }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Invalid OTP');
      setStep('done');
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = callbackUrl;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setStep('sent');
    }
  };

  if (step === 'loading' || step === 'skip') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D4C3E]">
        <div className="text-white text-center">
          <div
            style={{ animation: 'spin 1s linear infinite' }}
            className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-[#A7C7C1] text-sm">Setting up your account…</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (step === 'done') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D4C3E]">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-white text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-[#A7C7C1]">Redirecting you to the app…</p>
        </div>
      </main>
    );
  }

  const digits = otp.split('').concat(Array(6).fill('')).slice(0, 6);
  const isFilled = otp.replace(/\s/g, '').length === 6;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white opacity-[0.04]" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white opacity-[0.04]" />
      </div>

      <div className="relative w-full max-w-[420px] bg-white rounded-[28px] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-[80px] h-[80px] rounded-full bg-[#0D4C3E] flex items-center justify-center mb-4 shadow-lg">
            <img
              src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
              alt="Scoolam"
              className="w-[58px] h-[58px] object-contain"
            />
          </div>
          {/* Email icon removed — logo is sufficient */}
          <h1 className="text-[24px] font-extrabold text-[#0D4C3E] tracking-tight text-center">
            Check Your Email
          </h1>
          <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
            We sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-[52px] h-[60px] text-center text-[26px] font-black rounded-[14px] border-2 outline-none transition-all
                ${digit ? 'border-[#0D4C3E] bg-[#E8F5F0] text-[#0D4C3E]' : 'border-gray-200 bg-gray-50 text-gray-800'}
                focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20`}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-[10px] bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600 mb-4 text-center">
            {error}
          </div>
        )}

        <button
          onClick={() => void handleVerify()}
          disabled={!isFilled || step === 'verifying'}
          className="w-full rounded-[14px] bg-[#0D4C3E] p-[14px] text-[16px] font-bold text-white shadow-md hover:bg-[#0a3d32] active:scale-[0.98] transition-all disabled:opacity-40 mb-4"
        >
          {step === 'verifying' ? (
            <span className="flex items-center justify-center gap-2">
              <span
                style={{ animation: 'spin 1s linear infinite' }}
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
              />
              Verifying…
            </span>
          ) : (
            'Verify Email'
          )}
        </button>

        <div className="text-center">
          {resendCountdown > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${resendCountdown <= 10 ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
              >
                <span className="relative flex h-3 w-3">
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${resendCountdown <= 10 ? 'bg-orange-400' : 'bg-[#0D4C3E]'}`}
                  />
                </span>
                <span>
                  Code expires in{' '}
                  <span
                    className={`font-black tabular-nums ${resendCountdown <= 10 ? 'text-orange-600' : 'text-[#0D4C3E]'}`}
                  >
                    {String(Math.floor(resendCountdown / 60)).padStart(2, '0')}:
                    {String(resendCountdown % 60).padStart(2, '0')}
                  </span>
                </span>
              </div>
              {resendCountdown <= 10 && (
                <p className="text-xs text-orange-500 font-medium">⚠️ Code expiring soon</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                hasSentRef.current = false;
                void sendOtp(email);
              }}
              className="text-sm text-[#0D4C3E] font-semibold hover:underline bg-[#E8F5F0] px-4 py-2 rounded-full transition-all hover:bg-[#D1EAE4]"
            >
              ↺ Resend verification code
            </button>
          )}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
          Check your spam folder if you don&apos;t see it within a minute.
        </p>
      </div>
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
