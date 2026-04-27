"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/Button"
import { ArrowRight } from "lucide-react"

interface Product {
  id: string
  name: string
  slug?: string
  reference: string
  material: string
  gender: string
  color: string
  price: number
  salePrice?: number
  images: string[]
  inStock: boolean
  isNewCollection?: boolean
}

interface CatalogueSectionProps {
  /** Pre-fetched products from a Server Component parent. When provided the
   * client-side fetch is skipped entirely. */
  initialProducts?: Product[]
}

export default function CatalogueSection({ initialProducts }: CatalogueSectionProps = {}) {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  const [loading, setLoading] = useState(!initialProducts)

  useEffect(() => {
    if (initialProducts) return // data already provided by SSR
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=8")
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data.slice(0, 8) : [])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [initialProducts])

  return (
    <section className="py-20 bg-[#EEE9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1B2632] mb-4 text-pretty">
              {t.featuredProducts}
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              {t.featuredProductsDesc}
            </p>
          </div>
          <Link href="/products">
            <Button variant="secondary" className="hidden sm:flex items-center gap-2">
              {t.viewAll}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {products.map((product) => (
                <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                    {/* Image container */}
                    <div className="aspect-4/3 bg-linear-to-br from-[#EEE9DF] to-[#80827f]/10 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">{t.noImage}</div>
                      )}
                      {product.isNewCollection && (
                        <div className="absolute top-2 right-2 bg-[#f56a24] text-white px-2 py-0.5 text-xs font-bold rounded-full">
                          {t.newBadge}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex flex-col grow">
                      <h3 className="font-bold text-sm text-[#1B2632] mb-0.5 group-hover:text-[#f56a24] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{product.reference}</p>

                      <div className="flex items-center gap-1.5 text-xs text-gray-600 grow">
                        <span>{product.material}</span>
                        <span>•</span>
                        <span>{product.gender}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center sm:hidden">
              <Link href="/products">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  {t.viewAllProducts}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
