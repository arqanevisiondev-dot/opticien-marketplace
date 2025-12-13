"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { ChevronRight, Package, Search, Filter, X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  _count: {
    products: number
  }
}

interface Product {
  id: string
  name: string
  slug: string
  reference: string
  material: string | null
  gender: string | null
  marque: string | null
  color: string | null
  price: number
  salePrice: number | null
  images: string[]
  inStock: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
}

function CategoriesContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams?.get("category") || ""
  
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    marque: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Extract unique values for filters
  const uniqueGenders = Array.from(new Set(products.map(p => p.gender).filter(Boolean)))
  const uniqueMarques = Array.from(new Set(products.map(p => p.marque).filter(Boolean)))

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      // Only set if categoryParam is not empty
      setFilters(prev => ({ ...prev, category: categoryParam }))
    }
  }, [categoryParam, categories])

  useEffect(() => {
    filterProducts()
  }, [products, filters, searchQuery])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      const normalized = data.map((product: any) => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
      }))
      setProducts(normalized)
      setFilteredProducts(normalized)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (filters.category) {
      filtered = filtered.filter(p => p.category?.slug === filters.category)
    }

    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender)
    }

    if (filters.marque) {
      filtered = filtered.filter(p => p.marque === filters.marque)
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.marque?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL - only add parameters that have values
    const params = new URLSearchParams()
    if (newFilters.category) params.set("category", newFilters.category)
    if (newFilters.gender) params.set("gender", newFilters.gender)
    if (newFilters.marque) params.set("marque", newFilters.marque)
    
    const queryString = params.toString()
    router.push(`/categories${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setFilters({ category: "", gender: "", marque: "" })
    setSearchQuery("")
    router.push("/categories")
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-red-600">Erreur: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2C3B4D] via-[#1B2632] to-[#0f161f] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              {t.allProducts || "Tous les produits"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              {t.allProductsDescription || "Découvrez notre gamme complète de lunettes et accessoires"}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Products Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchProduct}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f56a24] focus:ring-2 focus:ring-[#f56a24]/20 transition-all"
                />
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1B2632] text-white rounded-lg hover:bg-[#2C3B4D] transition-colors relative"
              >
                <Filter className="h-5 w-5" />
                {t.filters}
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f56a24] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#1B2632]">{t.filters}</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#f56a24] hover:text-[#f56a24]/80 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      {t.clearAll}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.category}</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
                    >
                      <option value="">{t.allCategoriesFilter}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat._count.products})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.gender}</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => handleFilterChange("gender", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
                    >
                      <option value="">{t.allGendersFilter}</option>
                      {uniqueGenders.map((gender) => (
                        <option key={gender || 'null'} value={gender || ''}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Marque Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.brand}</label>
                    <select
                      value={filters.marque}
                      onChange={(e) => handleFilterChange("marque", e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f56a24] transition-colors"
                    >
                      <option value="">{t.allBrandsFilter}</option>
                      {uniqueMarques.map((marque) => (
                        <option key={marque || 'null'} value={marque || ''}>
                          {marque}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-bold text-[#1B2632]">{filteredProducts.length}</span> produit{filteredProducts.length !== 1 && 's'} trouvé{filteredProducts.length !== 1 && 's'}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalogue/${product.slug}`}
                  className="group bg-white rounded-lg border-2 border-gray-200 hover:border-[#f56a24]/60 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    {product.salePrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        PROMO
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-[#1B2632] mb-1 group-hover:text-[#f56a24] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">Réf: {product.reference}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.marque && (
                        <span className="text-xs px-2 py-1 bg-[#f56a24]/10 text-[#f56a24] rounded">
                          {product.marque}
                        </span>
                      )}
                      {product.gender && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {product.gender}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.salePrice ? (
                          <div>
                            <span className="text-lg font-bold text-[#f56a24]">{product.salePrice}DH</span>
                            <span className="text-sm text-gray-400 line-through ml-2">{product.price}DH</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-[#1B2632]">{product.price}DH</span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#f56a24] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">
                {activeFiltersCount > 0 || searchQuery
                  ? "Aucun produit ne correspond à vos critères."
                  : "Aucun produit disponible pour le moment."}
              </p>
              {(activeFiltersCount > 0 || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-[#f56a24] text-white rounded-lg hover:bg-[#f56a24]/90 transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24] mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  )
}
