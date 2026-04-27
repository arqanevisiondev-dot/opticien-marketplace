import { headers } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Eye, MapPin, ShoppingBag, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { translations } from '@/lib/i18n'
import type { Language } from '@/lib/i18n'
import HeroSlider from '@/components/HeroSlider'
import CatalogueSection from '@/components/catalogue-section'
import CategoriesSection from '@/components/categories-section'
import SignupPrompt from '@/components/SignupPrompt'

/**
 * ISR: re-generate this page at most every 60 seconds.
 * Vercel CDN caches the rendered HTML and serves it without hitting origin,
 * which eliminates Fast Origin Transfer for every subsequent visitor.
 */
export const revalidate = 60

function pickLang(acceptLang: string): Language {
  const supported: Language[] = ['fr', 'en', 'ar']
  const parts = acceptLang.split(',').map((p) => p.split(';')[0].trim().toLowerCase())
  for (const p of parts) {
    const code = p.split('-')[0] as Language
    if (supported.includes(code)) return code
  }
  return 'fr'
}

export default async function Home() {
  const headersList = await headers()
  const lang = pickLang(headersList.get('accept-language') ?? '')
  const t = translations[lang]

  const now = new Date()

  const [rawSlides, rawProducts, categories] = await Promise.all([
    prisma.slide.findMany({
      where: {
        isActive: true,
        OR: [
          { AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }] },
          { AND: [{ startDate: null }, { endDate: null }] },
        ],
      },
      orderBy: { order: 'asc' },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        reference: true,
        material: true,
        gender: true,
        color: true,
        price: true,
        salePrice: true,
        images: true,
        inStock: true,
        isNewCollection: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: { select: { products: true } },
      },
    }),
  ])

  const slides = rawSlides.filter((s) => s.imageUrl)

  const products = rawProducts.map((p) => {
    let images: string[] = []
    try {
      const raw = p.images as unknown
      if (Array.isArray(raw)) images = raw as string[]
      else if (typeof raw === 'string' && raw.length > 0) images = JSON.parse(raw) as string[]
    } catch { images = [] }
    return { ...p, images, isNewCollection: Boolean(p.isNewCollection) }
  })

  return (
    <div className="min-h-screen">
      <HeroSlider initialSlides={slides as any} />

      <section className="bg-gradient-to-br from-[#2C3B4D] via-[#1B2632] to-[#0f161f] text-white py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-pretty">{t.heroTitle}</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">{t.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogue">
                <Button variant="secondary" size="lg" className="flex items-center justify-center w-full sm:w-auto">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t.discoverCatalog}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#1B2632] bg-transparent"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t.becomePartner}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CatalogueSection initialProducts={products as any} />
      <CategoriesSection initialCategories={categories as any} />

      <section className="py-16 md:py-24 bg-[#EEE9DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 text-[#1B2632]">
            {t.features}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.exclusiveCatalog}</h3>
              <p className="text-gray-600">{t.exclusiveCatalogDesc}</p>
            </div>
            <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.fastDelivery}</h3>
              <p className="text-gray-600">{t.fastDeliveryDesc}</p>
            </div>
            <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.professionalPrices}</h3>
              <p className="text-gray-600">{t.professionalPricesDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-pretty">{t.ctaTitle}</h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">{t.ctaSubtitle}</p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg">
              {t.createFreeAccount}
            </Button>
          </Link>
        </div>
      </section>

      {/* Client component — handles the signup modal for unauthenticated visitors */}
      <SignupPrompt />
    </div>
  )
}
