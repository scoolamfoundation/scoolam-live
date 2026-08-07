'use client';
/**
 * ⚠ ANYTHING PLATFORM — DO NOT REWRITE THIS FILE ⚠
 *
 * Shipped v2 auth scaffolding. Same contract as signup/page.tsx: <form
 * onSubmit>, e.preventDefault(), and window.location.href redirect are all
 * load-bearing for the mobile WebView. DO NOT replace <form onSubmit> with
 * <button onClick> — that broke signin platform-wide in a prior AI rewrite.
 *
 *   Safe:   restyle, rewrite copy, add form fields.
 *   Unsafe: replacing <form>, removing preventDefault, bypassing
 *           authClient.signIn.email, changing the callbackUrl redirect.
 */

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { SocialSignInButtons } from '@/components/SocialSignInButtons';
import { authClient } from '@/lib/auth-client';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot-password inline state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? 'Sign in failed');
      setLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      // Check if the user is an admin and redirect accordingly
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          window.location.href = '/admin';
          return;
        }
      } catch {
        // not admin, fall through to callbackUrl
      }
      window.location.href = callbackUrl;
    } else {
      console.warn('signin: window is undefined; cannot redirect to callbackUrl');
    }
  };

  const onForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotErrorMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail || email }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setForgotStatus('sent');
      } else {
        setForgotErrorMsg(data.error ?? 'Failed to send reset email. Please try again.');
        setForgotStatus('error');
      }
    } catch {
      setForgotErrorMsg('Network error. Please try again.');
      setForgotStatus('error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-[16px]">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-white opacity-[0.04]" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-white opacity-[0.04]" />
      </div>

      {/* ── Forgot Password inline panel ── */}
      {forgotMode ? (
        <div className="relative flex w-full max-w-[400px] flex-col gap-[16px] rounded-[28px] bg-white p-[32px] shadow-2xl">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-[90px] h-[90px] rounded-full bg-[#0D4C3E] flex items-center justify-center mb-4 shadow-lg">
              <img
                src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                alt="Scoolam"
                className="w-[66px] h-[66px] object-contain"
              />
            </div>
            <h1 className="text-[24px] font-extrabold text-[#0D4C3E] tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-gray-400 text-sm mt-1 text-center">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {forgotStatus === 'sent' ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-gray-800 font-semibold text-[15px]">Reset link sent!</p>
              <p className="text-gray-500 text-[13px]">
                Check your inbox for a password reset email. It may take a few minutes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotStatus('idle');
                  setForgotEmail('');
                }}
                className="text-[#0D4C3E] font-bold text-sm hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                void onForgotSubmit(e);
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
                Email Address
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="rounded-[14px] border border-gray-200 bg-gray-50 p-[13px] text-[15px] outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20 focus:bg-white transition-all"
                />
              </label>

              {forgotStatus === 'error' && (
                <div className="rounded-[10px] bg-red-50 border border-red-100 p-[10px] text-[13px] text-red-600">
                  {forgotErrorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="rounded-[14px] bg-[#0D4C3E] p-[14px] text-[16px] font-bold text-white shadow-md hover:bg-[#0a3d32] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {forgotLoading ? 'Sending reset link…' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotStatus('idle');
                }}
                className="text-center text-[13px] text-gray-500 hover:text-[#0D4C3E] transition-colors font-medium"
              >
                ← Back to <span className="text-[#0D4C3E] font-bold">Sign In</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* ── Normal Sign In form ── */
        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="relative flex w-full max-w-[400px] flex-col gap-[16px] rounded-[28px] bg-white p-[32px] shadow-2xl"
        >
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-[90px] h-[90px] rounded-full bg-[#0D4C3E] flex items-center justify-center mb-4 shadow-lg">
              <img
                src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                alt="Scoolam"
                className="w-[66px] h-[66px] object-contain"
              />
            </div>
            <h1 className="text-[26px] font-extrabold text-[#0D4C3E] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your learning account</p>
          </div>

          {/* Email */}
          <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
            Email
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[14px] border border-gray-200 bg-gray-50 p-[13px] text-[15px] outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20 focus:bg-white transition-all"
            />
          </label>

          {/* Password — label row with Forgot Password? link */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-600">Password</span>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(true);
                  setForgotEmail(email);
                  setForgotStatus('idle');
                }}
                className="text-[12px] font-semibold text-[#0D4C3E] hover:underline hover:text-[#0a3d32] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[14px] border border-gray-200 bg-gray-50 p-[13px] text-[15px] outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20 focus:bg-white transition-all"
            />
          </div>

          {error && (
            <div className="rounded-[10px] bg-red-50 border border-red-100 p-[10px] text-[13px] text-red-600">
              {/invalid.*password|password.*invalid|invalid.*credential|credential/i.test(error) ? (
                <span>
                  Invalid email or password.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setForgotEmail(email);
                      setForgotStatus('idle');
                    }}
                    className="font-bold underline text-[#0D4C3E] hover:text-[#0a3d32] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </span>
              ) : (
                error
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-[14px] bg-[#0D4C3E] p-[14px] text-[16px] font-bold text-white shadow-md hover:bg-[#0a3d32] active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <SocialSignInButtons callbackUrl={callbackUrl} />

          <a
            href="/account/signup"
            className="text-center text-[13px] text-gray-500 hover:text-[#0D4C3E] transition-colors font-medium"
          >
            Don&apos;t have an account? <span className="text-[#0D4C3E] font-bold">Sign up</span>
          </a>
        </form>
      )}
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
