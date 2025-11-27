import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    const session = await auth();
    
    if (!session || !session.user) {
      // Redirect to signin with callback URL
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has ADMIN role
    if (session.user.role !== 'ADMIN') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protected API routes - admin endpoints
  if (pathname.startsWith('/api/admin')) {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
