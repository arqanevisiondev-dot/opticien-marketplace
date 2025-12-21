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

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

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
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-palladian to-white">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
              ? "opacity-100 translate-x-0"
              : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
              }`}
          >
            <div
              className="relative h-full w-full"
              style={{
                backgroundColor: s.backgroundColor || "transparent",
              }}
            >
              {/* Background Images */}
              <div className="absolute inset-0">
                {/* Desktop Image (> 1024px) */}
                <div className="hidden lg:block absolute inset-0">
                  <Image
                    src={s.imageUrl || "/placeholder.svg"}
                    alt={s.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                {/* Tablet Image (640px - 1024px) */}
                <div className="hidden sm:block lg:hidden absolute inset-0">
                  <Image
                    src={s.imageUrlTablet || s.imageUrl || "/placeholder.svg"}
                    alt={s.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                {/* Mobile Image (< 640px) */}
                <div className="block sm:hidden absolute inset-0">
                  <Image
                    src={s.imageUrlMobile || s.imageUrl || "/placeholder.svg"}
                    alt={s.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-full">
                  <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6 py-8 sm:py-10 md:py-12">
                    {/* Type Badge */}
                    <div className="flex items-center space-x-2">
                      <div className="inline-flex items-center space-x-2 bg-burning-flame/95 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg backdrop-blur-sm">
                        <TypeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-semibold text-xs sm:text-sm">
                          {s.type === "NEWS" && "Actualité"}
                          {s.type === "PRODUCT" && "Produit"}
                          {s.type === "PROMOTION" && "Promotion"}
                          {s.type === "ANNOUNCEMENT" && "Annonce"}
                        </span>
                      </div>
                    </div>

                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight drop-shadow-2xl line-clamp-2"
                      style={{ color: s.textColor || "#FFFFFF" }}
                    >
                      {s.title}
                    </h1>

                    {s.subtitle && (
                      <p
                        className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold drop-shadow-lg line-clamp-2"
                        style={{ color: s.textColor || "#FFFFFF" }}
                      >
                        {s.subtitle}
                      </p>
                    )}

                    {s.description && (
                      <p
                        className="text-xs sm:text-sm md:text-base text-white/95 max-w-xl drop-shadow-md line-clamp-3"
                        style={{ color: s.textColor ? `${s.textColor}E6` : "#FFFFFFE6" }}
                      >
                        {s.description}
                      </p>
                    )}

                    {s.linkUrl && (
                      <div className="pt-2 sm:pt-4">
                        <Link
                          href={s.linkUrl}
                          className="inline-flex items-center px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: s.buttonColor || "#f56a24",
                            color: "#FFFFFF",
                          }}
                        >
                          <span className="truncate max-w-[200px] sm:max-w-none">{s.linkText || "En savoir plus"}</span>
                          <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full transition-all duration-300 group shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full transition-all duration-300 group shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 sm:space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${index === currentSlide
              ? "w-8 sm:w-12 h-2.5 sm:h-3 bg-burning-flame shadow-lg"
              : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/60 hover:bg-white/90"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-burning-flame transition-all duration-[5000ms] ease-linear shadow-lg"
            style={{
              width: currentSlide === slides.indexOf(slide) ? "100%" : "0%",
            }}
          />
        </div>
      )}
    </div>
  )
}
