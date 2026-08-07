import { NextRequest, NextResponse } from 'next/server';

// Allow all origins for API routes (mobile app needs cross-origin access)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-createxyz-project-group-id, x-forwarded-host, x-createxyz-host, host',
  'Access-Control-Max-Age': '86400',
};

/**
 * Paths that are fully public — no session required.
 */
const PUBLIC_PATHS = new Set([
  '/',
  '/privacy-policy',
  '/terms-of-service',
  '/subscription-success',
  '/subscription-cancelled',
  '/certificate',
  '/admin/login',
]);

/**
 * Prefixes that are always public:
 *  /account/*  sign-in, sign-up, verify-email, social-dev-shim, logout
 *  /api/*      API routes enforce their own auth (requireAdmin / getSession)
 *  /_next/*    Next.js internal bundles
 */
const PUBLIC_PREFIXES = ['/account/', '/api/', '/_next/'];

/**
 * Session-token cookie written by better-auth.
 * Must match `cookiePrefix: 'better-auth'` in /lib/auth.ts.
 */
const SESSION_COOKIE = 'better-auth.session_token';

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS pre-flight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // CORS headers on every API response
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Public paths — no auth check needed
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for the better-auth session cookie.
  // Presence means an active session exists; actual session validity and
  // admin-role check are enforced server-side by requireAdmin() / getSession()
  // inside each API route handler.
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // Admin routes — redirect to /admin/login if no session
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // All other protected routes — redirect to sign-in if no session
  if (!sessionToken) {
    const signInUrl = new URL('/account/signin', request.url);
    signInUrl.searchParams.set('callbackURL', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every path EXCEPT Next.js internals and static assets:
     * _next/static, _next/image, favicon, and common static file extensions
     */
    '/((?!_next/static|_next/image|favicon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
