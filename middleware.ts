import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware - authentication is handled in route handlers
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all requests to pass through
  // Authentication will be checked in individual route handlers
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
