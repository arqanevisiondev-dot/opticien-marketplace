import { NextRequest, NextResponse } from 'next/server'

/**
 * Aggressive scrapers and AI crawlers that we never want to serve.
 * These consume bandwidth without any SEO benefit.
 */
const BLOCKED_UA_FRAGMENTS = [
  'semrushbot', 'ahrefsbot', 'dotbot', 'mj12bot', 'blexbot',
  'bytespider', 'gptbot', 'ccbot', 'claude-web', 'anthropic-ai',
  'cohere-ai', 'omgili', 'dataforseo', 'serpstatbot', 'seokicks',
  'scrapy', 'python-requests', 'python-urllib', 'libwww-perl',
  'go-http-client', 'okhttp', 'wget/',
]

/**
 * Legitimate SEO crawlers that we allow on public-facing pages only.
 * These help with indexing and bring real organic traffic.
 */
const SEO_BOT_FRAGMENTS = ['googlebot', 'bingbot', 'duckduckbot', 'yandexbot', 'applebot']

/**
 * Pages SEO bots are allowed to crawl.
 * Everything else (API routes, admin, auth) is blocked for bots.
 */
const SEO_ALLOWED_PREFIXES = ['/', '/catalogue', '/categories', '/contact', '/legal']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = (request.headers.get('user-agent') ?? '').toLowerCase()

  // Always allow Next.js internals and auth callbacks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Block aggressive scrapers and AI crawlers on every route
  if (BLOCKED_UA_FRAGMENTS.some((fragment) => ua.includes(fragment))) {
    return new NextResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Retry-After': '86400' },
    })
  }

  // Allow legitimate SEO bots only on public marketing pages
  const isSeoBot = SEO_BOT_FRAGMENTS.some((fragment) => ua.includes(fragment))
  if (isSeoBot) {
    const isAllowed = SEO_ALLOWED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    )
    if (!isAllowed) {
      return new NextResponse(null, { status: 403 })
    }
    return NextResponse.next()
  }

  // Block requests with an empty User-Agent hitting API routes
  // (real browsers always send a UA; empty UA is a strong scraper signal)
  if (!ua && pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 429 })
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except static files to keep the check cheap
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf)).*)',
  ],
}
