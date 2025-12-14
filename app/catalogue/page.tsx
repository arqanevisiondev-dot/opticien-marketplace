"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCart } from "@/contexts/CartContext"

interface Product {
  id: string
  name: string
  slug?: string
  reference: string
  material: string
  gender: string
  marque: string
  color: string
  price: number
  salePrice?: number
  loyaltyPointsReward?: number
  images: string[]
  inStock: boolean
  isNewCollection?: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

type ApiProduct = Omit<Product, "images"> & {
  images?: unknown
  isNewCollection?: boolean | null
}

export default function CataloguePage() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const { add, isInCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    material: "",
    gender: "",
    marque: "",
    color: "",
  })

  const canSeePrices =
    status === 'authenticated' && (
      (session?.user?.role === "OPTICIAN" && session?.user?.opticianStatus === "APPROVED") ||
      session?.user?.role === "ADMIN"
    )

  // debug: log session/status (temporary)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('Catalogue page session debug', { status, user: session?.user })
  }, [status, session])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const effectiveCanSeePrices = !isMobile && canSeePrices
  const isOptician = session?.user?.role === "OPTICIAN"

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) {
        console.error("Failed to fetch products, status:", res.status)
        setProducts([])
        return
      }
      const data = await res.json()
      const rawProducts: ApiProduct[] = Array.isArray(data) ? (data as ApiProduct[]) : []
      const normalized: Product[] = rawProducts.map((product) => ({
        ...product,
        images: Array.isArray(product.images) ? product.images.map((img) => String(img)) : [],
        isNewCollection: Boolean(product.isNewCollection),
      }))
      setProducts(normalized)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const safeProducts = Array.isArray(products) ? products : []
  const uniqueMaterials = Array.from(new Set(safeProducts.map((p) => p.material).filter(Boolean)))
  const uniqueGenders = Array.from(new Set(safeProducts.map((p) => p.gender).filter(Boolean)))
  const uniqueMarques = Array.from(new Set(safeProducts.map((p) => p.marque).filter(Boolean)))
  const newCollectionProducts = safeProducts.filter((product) => product.isNewCollection)
  const featuredNewCollection = newCollectionProducts[0]
  const additionalNewCollection = newCollectionProducts.slice(1)

  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marque.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filters.category || product.category?.id === filters.category
    const matchesMaterial = !filters.material || product.material === filters.material
    const matchesGender = !filters.gender || product.gender === filters.gender
    const matchesMarque = !filters.marque || product.marque === filters.marque
    const matchesColor = !filters.color || product.color === filters.color

    return matchesSearch && matchesCategory && matchesMaterial && matchesGender && matchesMarque && matchesColor
  })

  return (
    <div className="min-h-screen bg-[#EEE9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B2632] mb-3 text-pretty">{t.catalog}</h1>
          <p className="text-lg text-gray-700">{t.exclusiveCatalogDesc}</p>
        </div>

        {/* Featured New Collection */}
        {featuredNewCollection && (
          <section className="mb-12">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <Link
                  href={`/catalogue/${featuredNewCollection.slug || featuredNewCollection.id}`}
                  className="relative lg:w-1/2 h-80 lg:h-auto"
                >
                  {featuredNewCollection.images?.[0] ? (
                    <img
                      src={featuredNewCollection.images[0] || "/placeholder.svg"}
                      alt={featuredNewCollection.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#EEE9DF] to-[#80827f]/10 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#f56a24] text-white px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
                    {t.newBadge}
                  </div>
                </Link>
                <div className="flex-1 p-8 lg:p-12 space-y-6 flex flex-col justify-center">
                  <span className="inline-flex items-center rounded-full bg-[#f56a24]/10 text-[#f56a24] px-3 py-1 text-sm font-semibold w-fit">
                    {t.newCollection}
                  </span>
                  <h2 className="text-4xl font-bold text-[#1B2632]">{featuredNewCollection.name}</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>{t.reference}:</strong> {featuredNewCollection.reference}
                    </p>
                    {featuredNewCollection.marque && (
                      <p>
                        <strong>Marque:</strong> {featuredNewCollection.marque}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{featuredNewCollection.material}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{featuredNewCollection.gender}</span>
                    {featuredNewCollection.color && (
                      <>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{featuredNewCollection.color}</span>
                      </>
                    )}
                  </div>
                  <Link href={`/catalogue/${featuredNewCollection.slug || featuredNewCollection.id}`}>
                    <Button variant="secondary" size="lg">
                      {t.view}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {additionalNewCollection.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {additionalNewCollection.map((product) => (
                  <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                    <div className="relative bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-square bg-gradient-to-br from-[#EEE9DF] to-[#80827f]/10">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#f56a24] text-white px-3 py-1 text-xs font-bold uppercase rounded-full">
                          {t.newBadge}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {t.reference}: {product.reference}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-6 md:p-8 shadow-lg rounded-xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-[#1B2632]" />
            <h3 className="text-lg font-bold text-[#1B2632]">{t.filterProducts}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
                />
              </div>
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
            >
              <option value="">{t.categories || "All Categories"}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
            >
              <option value="">{t.allMaterials}</option>
              {uniqueMaterials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
            >
              <option value="">{t.allGenders}</option>
              {uniqueGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>

            <select
              value={filters.marque}
              onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
            >
              <option value="">{t.allBrands}</option>
              {uniqueMarques.map((marque) => (
                <option key={marque} value={marque}>
                  {marque}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
            <p className="mt-4 text-gray-600">{t.loading}...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white shadow-lg rounded-xl">
            <p className="text-gray-600 text-lg">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                <div className="bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden group flex flex-col h-full">
                  <div className="aspect-square bg-gradient-to-br from-[#EEE9DF] to-[#80827f]/10 relative overflow-hidden">
                    {product.salePrice && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 text-xs font-bold uppercase rounded-full z-10">
                        PROMO
                      </div>
                    )}
                    {product.isNewCollection && (
                      <div className="absolute top-3 right-3 bg-[#f56a24] text-white px-3 py-1 text-xs font-bold uppercase rounded-full z-10">
                        {t.newBadge}
                      </div>
                    )}
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                    {isOptician && !product.inStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                        OUT OF STOCK
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      <p>
                        <strong>{t.ref}</strong> {product.reference}
                      </p>
                      {product.marque && (
                        <p>
                          <strong>{t.brand}</strong> {product.marque}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4 flex-grow">
                      <div className="text-xs text-gray-500">
                        <span>{product.material}</span>
                        <span className="mx-2">•</span>
                        <span>{product.gender}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      {isOptician && effectiveCanSeePrices && product.loyaltyPointsReward && product.loyaltyPointsReward > 0 && (
                        <div className="mb-3 bg-gradient-to-r from-[#f56a24]/10 to-transparent px-2 py-1.5 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4 text-[#f56a24]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold text-[#1B2632]">
                              +{product.loyaltyPointsReward} pts
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="text-sm font-semibold mb-3">
                        {effectiveCanSeePrices ? (
                          product.salePrice ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)} DH</span>
                              <span className="text-[#f56a24] text-xl">{product.salePrice.toFixed(2)} DH</span>
                            </div>
                          ) : (
                            <span className="text-[#f56a24] text-xl">{product.price.toFixed(2)} DH</span>
                          )
                        ) : (
                          <span className="text-gray-400">{t.priceOnRequest}</span>
                        )}
                      </div>

                      {isOptician && (
                        <Button
                          variant={isInCart(product.id) ? "outline" : "primary"}
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!isInCart(product.id)) {
                              const url = `/catalogue/${product.slug || product.id}`
                              add({
                                id: product.id,
                                name: product.name,
                                reference: product.reference,
                                url,
                                type: 'regular'
                              })
                            }
                          }}
                          className="w-full"
                        >
                          {isInCart(product.id) ? t.inCartBadge : t.addToCartButton}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] text-white p-12 text-center shadow-lg rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.professionalPrices}</h2>
          <p className="text-lg text-gray-200 mb-8">{t.ctaSubtitle}</p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg">
              {t.createFreeAccount}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
