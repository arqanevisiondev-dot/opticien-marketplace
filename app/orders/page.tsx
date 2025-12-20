"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { History, Package, ChevronDown, ChevronUp, ArrowLeft, Calendar, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface OrderItem {
  id: string
  productId: string
  productName: string
  productReference: string
  quantity: number
  unitPrice: number
  salePrice?: number
  remisePct?: number
  totalLine: number
  product?: {
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  createdAt: string
  totalAmount: number
  deliveryCost?: number
  deliveryTax?: number
  status: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "OPTICIAN") {
      router.push("/auth/signin")
      return
    }
    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/my-orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    const key = status?.toUpperCase?.() ?? status
    switch (key) {
      case "PENDING":
        return t.pending ?? status
      case "CONFIRMED":
        return (t as any).confirmed ?? status
      case "DELIVERED":
        return (t as any).delivered ?? status
      case "CANCELLED":
        return (t as any).cancelled ?? status
      default:
        return status
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEE9DF] via-white to-[#FFF5E8] py-6 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-3 md:mb-4 inline-flex items-center text-gray-600 hover:text-[#f56a24] text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToProfile}
            </Button>
          </Link>
          <div className="flex items-center gap-3 md:gap-4 mb-3">
            <div className="p-2 md:p-3 bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] rounded-lg md:rounded-xl shadow-lg">
              <History className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#2C3B4D] tracking-tight">
                {t.ordersPageTitle}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base lg:text-lg">
                {t.ordersPageSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 text-center">
            <Package className="mx-auto h-16 w-16 md:h-20 md:w-20 text-gray-400 mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">{t.noOrders}</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">{t.noOrdersYet}</p>
            <Link href="/catalogue">
              <Button className="bg-[#f56a24] hover:bg-[#d45a1e]">
                <Package className="h-4 w-4 mr-2" />
                {t.browseCatalog}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              const orderDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg md:rounded-xl shadow-xl overflow-hidden border-l-4 border-[#f56a24]"
                >
                  <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-[#f56a24]/10 rounded-lg">
                          <Package className="h-5 w-5 md:h-6 md:w-6 text-[#f56a24]" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            {orderDate}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{t.orderNumber} #{order.id.slice(0, 8)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                        <div className="text-left sm:text-right">
                          <p className="text-xl md:text-2xl font-bold text-[#2C3B4D]">
                            {Number(order.totalAmount ?? 0).toFixed(2)} {t.Dh}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {order.items.length} {t.items}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold border ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="p-1 md:p-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                              <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expandable) */}
                  {isExpanded && (
                    <div className="p-4 md:p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-blue-50 rounded-lg">
                          <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{t.orderSubtotal }</p>
                            <p className="font-bold text-sm md:text-base text-blue-900">
                              {Number((order.totalAmount ?? 0) - ((order.deliveryCost ?? order.deliveryTax) ?? 0)).toFixed(2)} {t.Dh}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-green-50 rounded-lg">
                          <Truck className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{t.deliveryFees }</p>
                            <p className="font-bold text-sm md:text-base text-green-900">
                              {( (order.deliveryCost ?? order.deliveryTax) ?? 0) === 0
                                ? (t.freeLabel ?? "Gratuit")
                                : `${Number((order.deliveryCost ?? order.deliveryTax) ?? 0).toFixed(2)} ${t.Dh}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-orange-50 rounded-lg">
                          <Package className="h-4 w-4 md:h-5 md:w-5 text-[#f56a24] flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">{t.totalLabel }</p>
                            <p className="font-bold text-sm md:text-base text-[#f56a24]">
                              {Number(order.totalAmount ?? 0).toFixed(2)} {t.Dh}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4">{t.orderItems }</h3>
                      <div className="space-y-3 md:space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 border-2 border-gray-200 rounded-lg"
                          >
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0] || "/placeholder.svg"}
                                alt={item.productName}
                                className="w-full sm:w-16 md:w-20 h-32 sm:h-16 md:h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm md:text-base text-[#2C3B4D] break-words">
                                {item.productName}
                              </h4>
                              <p className="text-xs md:text-sm text-gray-500">{(t.ref ?? "Réf")} {item.productReference}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                                <span className="text-xs md:text-sm text-gray-600">
                                  {t.quantityLabel}: <span className="font-semibold">{item.quantity}</span>
                                </span>
                                <span className="text-xs md:text-sm text-gray-600">
                                  {t.unitPrice}:{" "}
                                  <span className="font-semibold">
                                    {Number(item.salePrice ?? item.unitPrice ?? 0).toFixed(2)} {t.Dh}
                                  </span>
                                </span>
                                {item.remisePct && item.remisePct > 0 && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    {(t.discountPct ?? "-{pct}% remise").replace('{pct}', String(item.remisePct))}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="font-bold text-base md:text-lg text-[#f56a24]">
                                {Number(item.totalLine ?? 0).toFixed(2)} {t.Dh ?? "DH"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
