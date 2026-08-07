'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to reset password. Please try again.');
      } else {
        setSuccess(true);
        setTimeout(() => router.replace('/account/signin'), 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-4">
        <div className="relative flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[28px] bg-white p-[32px] shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Invalid Reset Link</h2>
          <p className="text-gray-500 text-sm">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <a
            href="/account/signin"
            className="mt-2 rounded-[14px] bg-[#0D4C3E] px-8 py-3 text-[15px] font-bold text-white hover:bg-[#0a3d32] transition-all"
          >
            Back to Sign In
          </a>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-4">
        <div className="relative flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[28px] bg-white p-[32px] shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
          <p className="text-gray-500 text-sm">
            Your password has been updated successfully. Redirecting you to sign in…
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-[#0D4C3E] animate-[progress_3s_linear_forwards] w-0" />
          </div>
          <a
            href="/account/signin"
            className="text-[#0D4C3E] font-semibold text-sm hover:underline"
          >
            Sign in now →
          </a>
        </div>
        <style jsx global>{`
          @keyframes progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#0D4C3E] p-4">
      {/* Decorative circles */}
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
            Set New Password
          </h1>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Choose a strong password for your account
          </p>
        </div>

        {/* New Password */}
        <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
          New Password
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[14px] border border-gray-200 bg-gray-50 p-[13px] pr-11 text-[15px] outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/20 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {/* Confirm Password */}
        <label className="flex flex-col gap-[6px] text-[13px] font-semibold text-gray-600">
          Confirm Password
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-[14px] border p-[13px] pr-11 text-[15px] outline-none focus:ring-2 transition-all bg-gray-50 ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-300/20'
                  : 'border-gray-200 focus:border-[#0D4C3E] focus:ring-[#0D4C3E]/20 focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <span className="text-[12px] text-red-500">Passwords do not match</span>
          )}
        </label>

        {error && (
          <div className="rounded-[10px] bg-red-50 border border-red-100 p-[10px] text-[13px] text-red-600 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[14px] bg-[#0D4C3E] p-[14px] text-[16px] font-bold text-white shadow-md hover:bg-[#0a3d32] active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
        >
          {loading ? 'Updating password…' : 'Reset Password'}
        </button>

        <a
          href="/account/signin"
          className="text-center text-[13px] text-gray-500 hover:text-[#0D4C3E] transition-colors font-medium"
        >
          ← Back to <span className="text-[#0D4C3E] font-bold">Sign In</span>
        </a>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
