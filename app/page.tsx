"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Eye, MapPin, ShoppingBag, Users } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import CategoriesSection from "@/components/categories-section"
import CatalogueSection from "@/components/catalogue-section"
import HeroSlider from "@/components/HeroSlider"

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [showAuthOptions, setShowAuthOptions] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [session, status])

  const handleYes = () => {
    setShowModal(false)
    setShowAuthOptions(true)
  }

  const handleNo = () => {
    setShowModal(false)
  }

  const handleLogin = () => {
    setShowAuthOptions(false)
    router.push("/auth/signin")
  }

  const handleSignup = () => {
    setShowAuthOptions(false)
    router.push("/auth/signup")
  }

  const handleCloseAuthModal = () => {
    setShowAuthOptions(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Slider - NEW */}
      <HeroSlider />

      {/* Hero Section - Updated gradient with burning flame accent color */}
      <section className="bg-gradient-to-br from-[#2C3B4D] via-[#1B2632] to-[#0f161f] text-white py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-pretty">{t.heroTitle}</h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">{t.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogue">
                <Button variant="secondary" size="lg" className="flex items-center justify-center w-full sm:w-auto">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t.discoverCatalog}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#1B2632] bg-transparent"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t.becomePartner}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Catalogue Section */}
      <CatalogueSection />

      {/* Features Section - Updated background with palladian color for contrast */}
      {!session && (
        <section className="py-16 md:py-24 bg-[#EEE9DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 text-[#1B2632]">
              {t.features}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.exclusiveCatalog}</h3>
                <p className="text-gray-600">{t.exclusiveCatalogDesc}</p>
              </div>

              <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.fastDelivery}</h3>
                <p className="text-gray-600">{t.fastDeliveryDesc}</p>
              </div>

              <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#f56a24] w-16 h-16 flex items-center justify-center mb-4 rounded-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1B2632]">{t.professionalPrices}</h3>
                <p className="text-gray-600">{t.professionalPricesDesc}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only shown when user is not connected */}
      {!session && (
        <section className="py-16 md:py-24 bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-pretty">{t.ctaTitle}</h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">{t.ctaSubtitle}</p>
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg">
                {t.createFreeAccount}
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Optician Prompt Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-[#1B2632] mb-4">{t.opticianPromptTitle}</h2>
            <div className="flex gap-4">
              <Button onClick={handleYes} variant="primary" size="lg" className="flex-1">
                {t.yes}
              </Button>
              <Button
                onClick={handleNo}
                variant="outline"
                size="lg"
                className="flex-1 border-[#f56a24] text-[#f56a24] bg-transparent"
              >
                {t.no}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Options Modal */}
      {showAuthOptions && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-[#1B2632] mb-4">{t.welcomeOptician}</h2>
            <p className="text-gray-600 mb-6">{t.authOptionsMessage}</p>
            <div className="flex flex-col gap-4">
              <Button onClick={handleLogin} variant="primary" size="lg" className="w-full">
                {t.login}
              </Button>
              <Button
                onClick={handleSignup}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                {t.signup}
              </Button>
              <Button
                onClick={handleCloseAuthModal}
                variant="outline"
                size="sm"
                className="w-full mt-2 border-gray-300 text-gray-600"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
