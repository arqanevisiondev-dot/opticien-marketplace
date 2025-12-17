"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import dynamic from "next/dynamic"
import { useCart } from "@/contexts/CartContext"

const NearestOpticianFinder = dynamic(() => import("@/components/opticians/NearestOpticianFinder"), {
  ssr: false,
})

interface Product {
  id: string
  name: string
  slug: string
  reference: string
  description: string
  material: string
  gender: string
  marque?: string
  shape: string
  color: string
  price: number
  salePrice?: number
  loyaltyPointsReward?: number
  images: string[]
  inStock: boolean
  user: {
    businessName: string
    phone: string
    whatsapp: string
    address?: string
    city?: string
    postalCode?: string
    latitude?: number
    longitude?: number
  }
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const resolvedParams = use(params)
  const { add, isInCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  const canSeePrices =
    status === 'authenticated' && (
      (session?.user?.role === "OPTICIAN" && session?.user?.opticianStatus === "APPROVED") ||
      session?.user?.role === "ADMIN"
    )

  // debug: log session/status (temporary)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('Product page session debug', { status, user: session?.user })
  }, [status, session])

  // hide prices on small screens to avoid exposing them on mobile if session logic is unreliable
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // allow admins and approved opticians to see prices even on mobile
  const isOptician = session?.user?.role === "OPTICIAN"
  const isAdmin = session?.user?.role === "ADMIN"
  const effectiveCanSeePrices = canSeePrices && (!isMobile || isOptician || isAdmin)
  const showContactLink = isAdmin || !effectiveCanSeePrices

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`)
      if (!res.ok) {
        router.push("/catalogue")
        return
      }
      const data = await res.json()
      setProduct(data)
    } catch (error) {
      console.error("Error fetching product:", error)
      router.push("/catalogue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEE9DF] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          <p className="mt-4 text-[#1B2632]">{t.loading}...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#EEE9DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Button */}
        <Link href="/catalogue">
          <Button variant="outline" size="sm" className="mb-8 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToCatalog}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <div className="flex flex-col">
            <div className="aspect-square bg-white shadow-lg rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">{t.noProducts}</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                      selectedImage === index ? "border-[#f56a24] shadow-md" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex-grow">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-[#f56a24]/10 text-[#f56a24] px-3 py-1 text-sm font-semibold">
                  {product.reference}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1B2632] mb-4 text-pretty">{product.name}</h1>

              {isOptician && !product.inStock && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 mb-6 rounded">
                  <p className="font-semibold">{t.outOfStock}</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-[#f56a24]/5 to-[#80827f]/5 p-6 rounded-xl mb-8 border border-[#f56a24]/20">
                {/* Show 'price on request' only to non-privileged users */}
                {!effectiveCanSeePrices && (
                  <p className="text-sm text-gray-600 mb-3">{t.priceOnRequest}</p>
                )}
                {effectiveCanSeePrices ? (
                  product.salePrice ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm text-gray-500 line-through font-medium">
                        {product.price.toFixed(2)} {t.Dh}
                      </span>
                      <span className="text-4xl font-bold text-[#f56a24]">{product.salePrice.toFixed(2)} {t.Dh}</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-[#f56a24]">{product.price.toFixed(2)} {t.Dh}</div>
                  )
                ) : null}

                {/* Contact link: visible to admin and to users who cannot see prices */}
                {showContactLink && (
                  <button
                    onClick={() => document.getElementById("supplier-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-base text-[#f56a24] hover:text-[#d85a1f] font-semibold underline cursor-pointer mt-3 block"
                  >
                    {isAdmin ? (t.contactOptician || "Contact the optician") : (t.contactForPrice)}
                  </button>
                )}

                {(effectiveCanSeePrices && product.loyaltyPointsReward && product.loyaltyPointsReward > 0) && (
                  <div className="mt-4 pt-4 border-t border-[#f56a24]/20">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#f56a24]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-[#1B2632]">
                        {t.earnPoints} <span className="text-[#f56a24] text-lg">{product.loyaltyPointsReward}</span> {t.pointsAfterValidation}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {t.pointsDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#EEE9DF] p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">{t.material}</p>
                  <p className="text-lg font-semibold text-[#1B2632]">{product.material}</p>
                </div>
                <div className="bg-[#EEE9DF] p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">{t.gender}</p>
                  <p className="text-lg font-semibold text-[#1B2632]">{product.gender}</p>
                </div>
                <div className="bg-[#EEE9DF] p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">{t.shape}</p>
                  <p className="text-lg font-semibold text-[#1B2632]">{product.shape}</p>
                </div>
                <div className="bg-[#EEE9DF] p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">{t.color}</p>
                  <p className="text-lg font-semibold text-[#1B2632]">{product.color}</p>
                </div>
              </div>

              {isOptician && (
                <div className="space-y-3 mb-6">
                  <Button
                    variant={isInCart(product.id) ? "outline" : "secondary"}
                    size="lg"
                    className="w-full"
                    onClick={() => {
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
                  >
                    {isInCart(product.id) ? (t.inCart || "Dans le panier") : (t.addToCart || "Ajouter au panier")}
                  </Button>
                </div>
              )}
            </div>

            {product.description && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-6">
                <h2 className="text-xl font-bold text-[#1B2632] mb-4">{t.description}</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {!isOptician && (
          <div id="supplier-section">
            <NearestOpticianFinder productName={product.name} />
          </div>
        )}
      </div>
    </div>
  )
}
