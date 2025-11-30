'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, Tag, Sparkles } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  type: 'NEWS' | 'PRODUCT' | 'PROMOTION' | 'ANNOUNCEMENT';
  linkUrl?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slides');
      const data = await response.json();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  if (loading || slides.length === 0) return null;

  const slide = slides[currentSlide];
  const typeIcons = {
    NEWS: Calendar,
    PRODUCT: Tag,
    PROMOTION: Sparkles,
    ANNOUNCEMENT: Calendar,
  };

  const TypeIcon = typeIcons[slide.type];

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-palladian to-white">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <div
              className="relative h-full w-full"
              style={{
                backgroundColor: s.backgroundColor || 'transparent',
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  className="object-cover opacity-90"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-full">
                  <div className="max-w-2xl space-y-6 animate-fade-in">
                    {/* Type Badge */}
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-2 bg-burning-flame/90 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                        <TypeIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {s.type === 'NEWS' && 'Actualité'}
                          {s.type === 'PRODUCT' && 'Produit'}
                          {s.type === 'PROMOTION' && 'Promotion'}
                          {s.type === 'ANNOUNCEMENT' && 'Annonce'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h1
                      className="text-4xl lg:text-6xl font-bold leading-tight"
                      style={{ color: s.textColor || '#FFFFFF' }}
                    >
                      {s.title}
                    </h1>

                    {/* Subtitle */}
                    {s.subtitle && (
                      <p
                        className="text-xl lg:text-2xl font-medium"
                        style={{ color: s.textColor || '#FFFFFF' }}
                      >
                        {s.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    {s.description && (
                      <p
                        className="text-lg text-white/90 max-w-xl"
                        style={{ color: s.textColor ? `${s.textColor}CC` : '#FFFFFFCC' }}
                      >
                        {s.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    {s.linkUrl && (
                      <div className="pt-4">
                        <Link
                          href={s.linkUrl}
                          className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                          style={{
                            backgroundColor: s.buttonColor || '#f56a24',
                            color: '#FFFFFF',
                          }}
                        >
                          {s.linkText || 'En savoir plus'}
                          <ChevronRight className="ml-2 w-5 h-5" />
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

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-12 h-3 bg-burning-flame'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-burning-flame transition-all duration-[5000ms] ease-linear"
            style={{
              width: currentSlide === slides.indexOf(slide) ? '100%' : '0%',
            }}
          />
        </div>
      )}
    </div>
  );
}
