"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Package } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface Product {
  id: string
  name: string
  slug: string
  reference: string
  material?: string
  gender?: string
  marque?: string
  color?: string
  price: number
  salePrice?: number
  images: string[]
  inStock: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
}

export default function CategoryProductsPage() {
  const params = useParams()
  const slug = (params as any)?.slug
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      fetch('/api/products').then((r) => r.ok ? r.json() : []),
      fetch('/api/categories').then((r) => r.ok ? r.json() : []),
    ])
      .then(([productsData, categoriesData]) => {
        const prods: Product[] = Array.isArray(productsData) ? productsData : []
        const filtered = prods.filter(p => p.category?.slug === slug)
        setProducts(filtered)

        const cats = Array.isArray(categoriesData) ? categoriesData : []
        const found = cats.find((c: any) => c.slug === slug)
        setCategoryName(found ? found.name : slug)
      })
      .catch((err) => {
        console.error('Error fetching category products', err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1B2632]">{categoryName || t.catalog}</h1>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
            <p className="mt-4 text-gray-600">{t.loading}...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white shadow-lg rounded-xl">
            <p className="text-gray-600 text-lg">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/catalogue/${product.slug || product.id}`} className="group bg-white rounded-lg border-2 border-gray-200 hover:border-[#f56a24]/60 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  {product.salePrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">PROMO</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Réf: {product.reference}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {session ? (
                        product.salePrice ? (
                          <div>
                            <span className="text-lg font-bold text-[#f56a24]">{product.salePrice}DH</span>
                            <span className="text-sm text-gray-400 line-through ml-2">{product.price}DH</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-[#1B2632]">{product.price}DH</span>
                        )
                      ) : (
                        <span className="text-sm text-gray-600">{t.seeMore}</span>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#f56a24] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
