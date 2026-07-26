/**
 * ⚠ ANYTHING PLATFORM — DO NOT REWRITE THIS FILE ⚠
 *
 * Renders the social sign-in buttons on the signin/signup pages. The set of
 * providers comes from NEXT_PUBLIC_CREATE_AUTH_PROVIDERS, which the platform
 * injects from the project's Authentication settings — so a provider only
 * appears here once it's enabled and configured. In the builder preview
 * (NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT', inside an iframe) real OAuth can't
 * run, so clicks route to the dev shim; everywhere else they run the real
 * better-auth social flow.
 *
 *   Safe:   restyle the buttons, reorder providers.
 *   Unsafe: bypassing authClient.signIn.social, removing the dev-shim branch.
 */
'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

const KNOWN_PROVIDERS = ['google', 'apple'] as const;
type SocialProvider = (typeof KNOWN_PROVIDERS)[number];

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

const PROVIDER_ICONS: Record<SocialProvider, React.ReactNode> = {
  google: (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
  apple: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
};

const enabledProviders = (process.env.NEXT_PUBLIC_CREATE_AUTH_PROVIDERS ?? '')
  .split(',')
  .map((p) => p.trim())
  .filter((p): p is SocialProvider => KNOWN_PROVIDERS.includes(p as SocialProvider));

const isDevPreviewIframe = () => {
  if (process.env.NEXT_PUBLIC_CREATE_ENV !== 'DEVELOPMENT') return false;
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
};

export function SocialSignInButtons({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const onClick = async (provider: SocialProvider) => {
    setError(null);
    setPending(provider);

    if (isDevPreviewIframe()) {
      const params = new URLSearchParams({ provider, callbackUrl });
      window.location.href = `/account/social-dev-shim?${params.toString()}`;
      return;
    }

    const { error: socialError } = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
    });
    if (socialError) {
      setError(socialError.message ?? `Could not sign in with ${provider}`);
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-[10px]">
      {enabledProviders.length > 0 && (
        <>
          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <span className="h-px flex-1 bg-gray-100" />
            <span className="text-[12px] text-gray-400 font-medium">or continue with</span>
            <span className="h-px flex-1 bg-gray-100" />
          </div>

          {enabledProviders.map((provider) => (
            <button
              key={provider}
              type="button"
              disabled={pending !== null}
              onClick={() => {
                void onClick(provider);
              }}
              className={`flex items-center justify-center gap-[10px] rounded-[14px] border-2 p-[13px] text-[15px] font-semibold transition-all disabled:opacity-50 active:scale-[0.98] ${
                provider === 'apple'
                  ? 'bg-black text-white border-black hover:bg-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#0D4C3E] hover:text-[#0D4C3E] shadow-sm hover:shadow-md'
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5 shrink-0">
                {provider === 'apple' ? (
                  <span className="text-white">{PROVIDER_ICONS[provider]}</span>
                ) : (
                  PROVIDER_ICONS[provider]
                )}
              </span>
              {pending === provider ? 'Redirecting…' : PROVIDER_LABELS[provider]}
            </button>
          ))}

          {error && (
            <div className="rounded-[10px] bg-red-50 border border-red-100 p-[10px] text-[13px] text-red-600">
              {error}
            </div>
          )}
        </>
      )}

      {/* Terms */}
      <p className="text-center text-[11px] text-gray-400 leading-relaxed mt-1">
        By continuing you agree to our{' '}
        <a
          href="/terms-of-service"
          target="_blank"
          className="text-[#0D4C3E] underline hover:no-underline font-semibold"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="/privacy-policy"
          target="_blank"
          className="text-[#0D4C3E] underline hover:no-underline font-semibold"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
