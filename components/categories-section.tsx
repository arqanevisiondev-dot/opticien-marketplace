"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
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
    <section className="py-20 bg-[#1B2632] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-pretty">
          {t.categories || "Our Categories"}
        </h2>
        <p className="text-lg text-gray-300 mb-16 max-w-2xl">
          {t.categoriesDescription || "Discover our wide range of eyewear organized by category"}
        </p>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogue?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3B4D] to-[#1B2632] border border-[#80827f]/20 hover:border-[#f56a24]/50 transition-all duration-300 p-8 flex flex-col justify-between min-h-64"
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f56a24]/10 rounded-full blur-3xl group-hover:bg-[#f56a24]/20 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#80827f]/5 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-[#f56a24] transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-200 transition-colors duration-300">
                    Browse our exclusive collection
                  </p>
                </div>

                {/* Accent bar and arrow */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="h-1 w-8 bg-[#f56a24] transform group-hover:w-16 transition-all duration-300" />
                  <ChevronRight className="h-6 w-6 text-[#f56a24] transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">No categories available at this time.</div>
        )}
      </div>
    </section>
  )
}
