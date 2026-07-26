/**
 * ⚠ ANYTHING PLATFORM — DO NOT REWRITE THIS FILE ⚠
 *
 * Shipped v2 auth scaffolding. The <form onSubmit>, e.preventDefault(), and
 * window.location.href redirect are load-bearing for the mobile WebView auth
 * flow (AuthWebView intercepts the navigation to capture the session). A
 * prior AI rewrite replaced <form onSubmit> with <button onClick> and broke
 * signup platform-wide — "credentials cleared" / "button does nothing" for
 * every user until a human reverted it. DO NOT repeat that mistake.
 *
 *   Safe:   restyle, rewrite copy, add form fields (pass `name` explicitly).
 *   Unsafe: replacing <form>, removing preventDefault, bypassing
 *           authClient.signUp.email, changing the callbackUrl redirect.
 */
'use client';

import { useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { SocialSignInButtons } from '@/components/SocialSignInButtons';
import { authClient } from '@/lib/auth-client';

function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: '',
    });

    if (signUpError) {
      setError(signUpError.message ?? 'Sign up failed');
      setLoading(false);
      return;
    }

    // ── After email signup: send OTP email and go to verify page ──
    if (typeof window !== 'undefined') {
      const verifyUrl = `/account/verify-email?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}&source=email`;
      window.location.href = verifyUrl;
    }
  };

  // Social providers also go through verify-email for new users
  const socialCallbackUrl = `/account/verify-email?callbackUrl=${encodeURIComponent(callbackUrl)}&source=google`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-[16px]">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-white opacity-[0.04]" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-white opacity-[0.04]" />
      </div>

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
            Create Account
          </h1>
          <p className="text-gray-400 text-sm mt-1">Join Scoolam and start learning today</p>
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

        {/* Password */}
        <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
          Password
          <input
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[14px] border border-gray-200 bg-gray-50 p-[13px] text-[15px] outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20 focus:bg-white transition-all"
          />
        </label>

        {/* Confirm Password */}
        <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
          Confirm Password
          <input
            type="password"
            required
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`rounded-[14px] border p-[13px] text-[15px] outline-none focus:ring-2 transition-all bg-gray-50 ${
              confirmPassword && confirmPassword !== password
                ? 'border-red-300 focus:border-red-400 focus:ring-red-300/20'
                : 'border-gray-200 focus:border-[#0D4C3E] focus:ring-[#0D4C3E]/20 focus:bg-white'
            }`}
          />
          {confirmPassword && confirmPassword !== password && (
            <span className="text-[12px] text-red-500">Passwords do not match</span>
          )}
        </label>

        {error && (
          <div className="rounded-[10px] bg-red-50 border border-red-100 p-[10px] text-[13px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[14px] bg-[#0D4C3E] p-[14px] text-[16px] font-bold text-white shadow-md hover:bg-[#0a3d32] active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        {/* Pass socialCallbackUrl so Google also goes through verify-email */}
        <SocialSignInButtons callbackUrl={socialCallbackUrl} />

        <a
          href="/account/signin"
          className="text-center text-[13px] text-gray-500 hover:text-[#0D4C3E] transition-colors font-medium"
        >
          Already have an account? <span className="text-[#0D4C3E] font-bold">Sign in</span>
        </a>
      </form>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
