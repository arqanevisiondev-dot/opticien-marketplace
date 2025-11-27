import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies
  const sessionToken = request.cookies.get('authjs.session-token') || 
                       request.cookies.get('__Secure-authjs.session-token');

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      // Redirect to signin with callback URL
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    // Note: Role check will be done in the actual pages/APIs
  }

  // Protected API routes - admin endpoints
  if (pathname.startsWith('/api/admin')) {
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }
    // Note: Role check will be done in the API routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
