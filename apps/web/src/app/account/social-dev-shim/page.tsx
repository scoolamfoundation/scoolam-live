'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

const isDev = process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT';

const DEV_EMAIL = 'dev@scoolam.com';
const DEV_PASSWORD = 'dev-social-dev@scoolam.com';

function SocialDevShim() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDev) router.replace('/');
  }, [router]);

  if (!isDev) return null;

  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    // Try sign in first, then sign up if account doesn't exist yet
    const { error: signInError } = await authClient.signIn.email({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    });

    if (signInError) {
      const { error: signUpError } = await authClient.signUp.email({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        name: 'Scoolam User',
      });
      if (signUpError) {
        setError('Could not complete sign-in. Please try again.');
        setLoading(false);
        return;
      }
    }

    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] p-4">
      <div className="flex w-full max-w-[420px] flex-col rounded-[28px] bg-white shadow-xl border border-gray-100 overflow-hidden">
        {/* Google header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <svg width="74" height="24" viewBox="0 0 74 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.74.99 11.53 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z"
              fill="#4285F4"
            />
            <path
              d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z"
              fill="#EA4335"
            />
            <path
              d="M53.58 7.49h-.09c-.57-.68-1.67-1.3-3.06-1.3C47.53 6.19 45 8.72 45 12c0 3.26 2.53 5.81 5.43 5.81 1.39 0 2.49-.62 3.06-1.32h.09v.81c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.33 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V6.49h-2.42v1zm-2.93 8.03c-1.76 0-3.1-1.5-3.1-3.52 0-2.05 1.34-3.52 3.1-3.52 1.74 0 3.1 1.49 3.1 3.54.01 2.03-1.36 3.5-3.1 3.5z"
              fill="#4285F4"
            />
            <path
              d="M38 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z"
              fill="#FBBC05"
            />
            <path d="M58.93 1h2.54v16.76h-2.54z" fill="#34A853" />
            <path
              d="M63.92 12.18c0-3.5 2.76-5.99 5.74-5.99 1.96 0 3.38.83 4.16 1.82l-1.66 1.63c-.57-.66-1.32-1.16-2.5-1.16-1.94 0-3.22 1.56-3.22 3.7 0 2.17 1.28 3.7 3.22 3.7 1.3 0 2.12-.59 2.66-1.25l1.66 1.63c-.86 1.05-2.28 1.93-4.32 1.93-2.98-.01-5.74-2.44-5.74-6.01z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-xs text-gray-400">accounts.google.com</span>
        </div>

        <div className="px-8 py-6">
          {/* App requesting access */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#0D4C3E] flex items-center justify-center mb-3 shadow-md">
              <img
                src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                alt="Scoolam"
                className="w-11 h-11 object-contain"
              />
            </div>
            <h2 className="text-[18px] font-semibold text-gray-800 text-center">
              Scoolam wants to access your Google Account
            </h2>
          </div>

          {/* Permission list */}
          <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-6 border border-gray-100">
            {[
              { icon: '👤', title: 'See your basic profile info', desc: 'Name, profile photo' },
              { icon: '✉️', title: 'See your email address', desc: 'Used to sign in to Scoolam' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 text-center mb-5 leading-relaxed">
            Make sure you trust Scoolam. You may be sharing sensitive info with this app.{' '}
            <span className="text-blue-500 cursor-pointer hover:underline">Learn more</span>
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-[13px] text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-[10px] border-2 border-gray-200 py-[12px] text-[14px] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleContinue()}
              disabled={loading}
              className="flex-1 rounded-[10px] bg-[#1A73E8] py-[12px] text-[14px] font-semibold text-white hover:bg-[#1765CC] transition-all disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SocialDevShimPage() {
  return (
    <Suspense>
      <SocialDevShim />
    </Suspense>
  );
}
