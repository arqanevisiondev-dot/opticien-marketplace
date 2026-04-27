import { prisma } from '@/lib/prisma'
import CatalogueClient from './CatalogueClient'

/**
 * ISR: Vercel CDN caches this page's HTML for 60 seconds.
 * Every visitor in that window gets the cached response — no origin call,
 * no Fast Origin Transfer cost. Client-side filtering keeps UX fully
 * interactive after hydration.
 */
export const revalidate = 60

export default async function CataloguePage() {
  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const products = rawProducts.map((p) => {
    let images: string[] = []
    try {
      const raw = p.images as unknown
      if (Array.isArray(raw)) images = raw as string[]
      else if (typeof raw === 'string' && raw.length > 0) images = JSON.parse(raw) as string[]
    } catch { images = [] }
    return {
      ...p,
      images,
      salePrice: p.salePrice ?? undefined,
      loyaltyPointsReward: (p as any).loyaltyPointsReward ?? undefined,
      isNewCollection: Boolean(p.isNewCollection),
    }
  })

  return (
    <CatalogueClient
      initialProducts={products as any}
      initialCategories={categories}
    />
  )
}
