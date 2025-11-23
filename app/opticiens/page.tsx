"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, MessageCircle, Map, List } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"

const MapComponent = dynamic(() => import("@/components/map/OpticianMap"), {
  ssr: false,
  loading: () => {
    const LoadingComponent = () => {
      const { t } = useLanguage()
      return (
        <div className="h-96 bg-gray-200 animate-pulse flex items-center justify-center text-gray-600">
          {t.loadingMap}
        </div>
      )
    }
    return <LoadingComponent />
  },
})

interface Optician {
  id: string
  businessName: string
  firstName: string
  lastName: string
  phone: string
  whatsapp?: string
  address?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
}

export default function OpticiensPage() {
  const { t } = useLanguage()
  const [opticians, setOpticians] = useState<Optician[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  useEffect(() => {
    fetchOpticians()
  }, [])

  const fetchOpticians = async () => {
    try {
      const res = await fetch("/api/opticians")
      const data = await res.json()
      setOpticians(data)
    } catch (error) {
      console.error("Error fetching opticians:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B2632] mb-3 text-pretty">{t.findAnOptician}</h1>
          <p className="text-lg text-gray-700 max-w-2xl">{t.locateOpticians}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            variant={viewMode === "map" ? "secondary" : "outline"}
            onClick={() => setViewMode("map")}
            className="flex items-center justify-center sm:justify-start"
            size="lg"
          >
            <Map className="mr-2 h-5 w-5" />
            {t.mapView}
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "outline"}
            onClick={() => setViewMode("list")}
            className="flex items-center justify-center sm:justify-start"
            size="lg"
          >
            <List className="mr-2 h-5 w-5" />
            {t.listView}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
            <p className="mt-4 text-gray-600">{t.loadingOpticians}</p>
          </div>
        ) : (
          <>
            {viewMode === "map" ? (
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <MapComponent opticians={opticians} />
              </div>
            ) : (
              <>
                {opticians.length === 0 ? (
                  <div className="text-center py-16 bg-white shadow-lg rounded-2xl">
                    <p className="text-gray-600 text-lg">{t.noOpticianFound}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opticians.map((optician) => (
                      <div
                        key={optician.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-[#f56a24]/10 to-[#80827f]/10 p-6 border-b border-gray-200">
                          <h3 className="text-xl font-bold text-[#1B2632] mb-1">{optician.businessName}</h3>
                          <p className="text-sm text-gray-600">
                            {optician.firstName} {optician.lastName}
                          </p>
                        </div>

                        <div className="p-6">
                          {optician.address && (
                            <div className="flex items-start gap-3 mb-6 text-gray-700">
                              <MapPin className="h-5 w-5 text-[#f56a24] flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <div className="font-medium">{optician.address}</div>
                                <div className="text-gray-600">
                                  {optician.postalCode} {optician.city}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full flex items-center justify-center"
                              onClick={() => handlePhoneClick(optician.phone)}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              {optician.phone}
                            </Button>

                            {optician.whatsapp && (
                              <Button
                                variant="secondary"
                                size="lg"
                                className="w-full flex items-center justify-center"
                                onClick={() => handleWhatsAppClick(optician.whatsapp!)}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
