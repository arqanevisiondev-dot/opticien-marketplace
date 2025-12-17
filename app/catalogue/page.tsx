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

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
            <p className="mt-4 text-gray-600">{t.loading}...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white shadow-lg rounded-xl">
            <p className="text-gray-600 text-lg">{t.noCategories || 'No categories found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <Link key={category.id} href={`/catalogue/category/${category.slug || category.id}`}>
                <div className="group bg-white rounded-lg border-2 border-gray-200 hover:border-[#f56a24]/60 transition-all duration-300 hover:shadow-xl overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-[#EEE9DF] to-[#80827f]/10 flex items-center justify-center">
                    {/* Image placeholder: server provides imageUrl if available */}
                    {(category as any)?.imageUrl ? (
                      <img src={(category as any).imageUrl} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">{category.name}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors line-clamp-2">{category.name}</h3>
                    <p className="text-sm text-gray-500">{t.viewCategory || 'View category'}</p>
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
