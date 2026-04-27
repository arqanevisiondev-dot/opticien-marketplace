"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar, Tag, Sparkles } from "lucide-react"

interface Slide {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  imageUrlTablet?: string
  imageUrlMobile?: string
  type: "NEWS" | "PRODUCT" | "PROMOTION" | "ANNOUNCEMENT"
  linkUrl?: string
  linkText?: string
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
}

interface HeroSliderProps {
  /** Pre-fetched slides passed from a Server Component parent. When provided,
   * the client-side fetch is skipped entirely. */
  initialSlides?: Slide[]
}

export default function HeroSlider({ initialSlides }: HeroSliderProps = {}) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides ?? [])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(!initialSlides)

  useEffect(() => {
    if (initialSlides) return // data already provided by SSR
    fetchSlides()
  }, [initialSlides])

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/slides")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSlides(data || [])
    } catch (error) {
      console.error("Error fetching slides:", error)
      setSlides([])
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, slides.length])

  if (loading || slides.length === 0) return null

  const slide = slides[currentSlide]

  if (!slide) return null

  const typeIcons = {
    NEWS: Calendar,
    PRODUCT: Tag,
    PROMOTION: Sparkles,
    ANNOUNCEMENT: Calendar,
  }

  const TypeIcon = typeIcons[slide.type]

  return (
    <div className="relative w-full h-[50vh] lg:h-[60vh] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full w-full" style={{ backgroundColor: s.backgroundColor || "#1B2632" }}>
              {/* Background image — single tag, responsive via sizes */}
              <Image
                src={s.imageUrl || "/placeholder.svg"}
                alt={s.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />

              {/* Dark overlay — left-heavy so text is always readable */}
              <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/40 to-black/10" />
              {/* Bottom fade that blends into the hero section */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#1B2632] to-transparent" />

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center">
                <div className="max-w-xl space-y-3 sm:space-y-4 pb-12">
                  {/* Type badge */}
                  <div className="inline-flex items-center gap-2 bg-[#f56a24] text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-md">
                    <TypeIcon className="w-3 h-3" />
                    {s.type === "NEWS" && "Actualité"}
                    {s.type === "PRODUCT" && "Produit"}
                    {s.type === "PROMOTION" && "Promotion"}
                    {s.type === "ANNOUNCEMENT" && "Annonce"}
                  </div>

                  <h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg line-clamp-2"
                    style={{ color: s.textColor || "#FFFFFF" }}
                  >
                    {s.title}
                  </h2>

                  {s.subtitle && (
                    <p
                      className="text-base sm:text-lg font-medium drop-shadow line-clamp-2 text-white/90"
                      style={{ color: s.textColor || undefined }}
                    >
                      {s.subtitle}
                    </p>
                  )}

                  {s.description && (
                    <p className="text-sm text-white/75 max-w-md line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  {s.linkUrl && (
                    <div className="pt-1">
                      <Link
                        href={s.linkUrl}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ backgroundColor: s.buttonColor || "#f56a24", color: "#fff" }}
                      >
                        {s.linkText || "En savoir plus"}
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide counter — top right */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-1 text-white/70 text-xs font-mono">
        <span className="text-white font-bold text-sm">{String(currentSlide + 1).padStart(2, "0")}</span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-[#f56a24]"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
          <div
            key={currentSlide}
            className="h-full bg-[#f56a24] animate-[progress_5s_linear_forwards]"
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  )
}