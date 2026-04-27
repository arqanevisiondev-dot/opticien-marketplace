import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://arqane-vision.vercel.app'
  return {
    rules: [
      {
        // Allow Google & Bing to index public marketing pages only
        userAgent: ['Googlebot', 'Bingbot'],
        allow: ['/', '/catalogue', '/catalogue/', '/categories', '/contact'],
        disallow: ['/admin', '/api/', '/auth/', '/orders', '/profile', '/loyalty-catalog'],
      },
      {
        // Block all AI training crawlers
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'cohere-ai', 'Bytespider'],
        disallow: ['/'],
      },
      {
        // Block all other bots from everything except the homepage
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/api/', '/auth/', '/orders', '/profile'],
        crawlDelay: 10,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
