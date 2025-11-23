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

export default function CatalogueSection() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=6")
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data.slice(0, 6) : [])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-20 bg-[#EEE9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1B2632] mb-4 text-pretty">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Explore our handpicked selection of premium eyewear and accessories
            </p>
          </div>
          <Link href="/catalogue">
            <Button variant="secondary" className="hidden sm:flex items-center gap-2">
              View All
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                    {/* Image container */}
                    <div className="aspect-square bg-gradient-to-br from-[#EEE9DF] to-[#80827f]/10 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                      {product.isNewCollection && (
                        <div className="absolute top-4 right-4 bg-[#f56a24] text-white px-3 py-1 text-xs font-bold rounded-full">
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">{product.reference}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-grow">
                        <span>{product.material}</span>
                        <span>•</span>
                        <span>{product.gender}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-[#f56a24] font-bold text-lg">
                          {product.salePrice ? `${product.salePrice.toFixed(2)}` : `${product.price.toFixed(2)}`} DH
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} DH</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center sm:hidden">
              <Link href="/catalogue">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  View All Products
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
