"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { ChevronRight } from "lucide-react"

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

export default function CategoriesSection() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-[#1B2632]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">Loading categories...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-[#1B2632]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#1B2632] to-[#0f161f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-pretty">
            {t.categories || "Nos Catégories"}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t.categoriesDescription || "Découvrez notre large gamme de lunettes organisée par catégorie"}
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3B4D] to-[#1B2632] border border-[#80827f]/20 hover:border-[#f56a24]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#f56a24]/20 transform hover:-translate-y-2"
              >
                {/* Image Background */}
                {category.imageUrl ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2632] via-[#1B2632]/50 to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-[#f56a24]/20 to-[#80827f]/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-[#f56a24]/30">{category.name.charAt(0)}</div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#f56a24] transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                      {category.description}
                    </p>
                  )}

                  {/* Product count badge */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-[#f56a24]/20 text-[#f56a24] rounded-full text-xs font-semibold">
                        {category._count.products} {category._count.products === 1 ? 'produit' : 'produits'}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#f56a24] transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 border-2 border-[#f56a24] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">Aucune catégorie disponible pour le moment.</div>
        )}

        {/* View All Button */}
        {categories.length > 6 && (
          <div className="text-center mt-12">
            <Link href="/categories">
              <button className="px-8 py-4 bg-[#f56a24] hover:bg-[#f56a24]/90 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Voir toutes les catégories ({categories.length})
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
