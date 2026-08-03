import { NextRequest, NextResponse } from 'next/server';

// Allow all origins for API routes (mobile app needs cross-origin access)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-createxyz-project-group-id, x-forwarded-host, x-createxyz-host, host',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request: NextRequest) {
  // Handle CORS preflight (OPTIONS) for API routes
  if (request.method === 'OPTIONS' && request.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // For all other API requests, add CORS headers to the response
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
