"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface Optician {
  id: string
  businessName: string
}

interface Product {
  id: string
  name: string
  reference: string
  stockQty: number
  price: number
}

interface OrderItem {
  productId: string
  quantity: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const [opticians, setOpticians] = useState<Optician[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOptician, setSelectedOptician] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderNote, setOrderNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opticiansRes, productsRes] = await Promise.all([
          fetch("/api/admin/opticians"),
          fetch("/api/admin/products"),
        ])

        if (opticiansRes.ok) {
          const data = await opticiansRes.json()
          setOpticians(data)
        }
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.products || [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(t.orderDataLoadError)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchData()
    }
  }, [session, t])

  const addOrderLine = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1 }])
  }

  const removeOrderLine = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: "productId" | "quantity", value: string | number) => {
    const updated = [...orderItems]
    if (field === "quantity") {
      updated[index].quantity = typeof value === "number" ? value : Number.parseInt(value as string, 10)
    } else {
      updated[index].productId = value as string
    }
    setOrderItems(updated)
  }

  const getProduct = (productId: string) => products.find((p) => p.id === productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedOptician) {
      setError(t.selectOpticianRequired)
      return
    }

    if (orderItems.length === 0) {
      setError(t.orderNeedsProduct)
      return
    }

    for (const item of orderItems) {
      if (!item.productId || item.quantity <= 0) {
        setError(t.quantityPositiveError)
        return
      }
      const product = getProduct(item.productId)
      if (!product) {
        setError(t.unknownProductError)
        return
      }
      if (product.stockQty < item.quantity) {
        setError(t.stockInsufficient)
        return
      }
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opticianId: selectedOptician,
          items: orderItems,
          note: orderNote,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t.errorSavingProduct)
      }

      router.push("/admin/orders")
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorSavingProduct)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-palladian py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/orders"
          className="mb-6 inline-flex items-center text-sm font-medium text-burning-flame hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToDashboard}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-abyssal mb-2">{t.newOrder}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t.manualOrderSubtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">{t.error}</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-gray-500 py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
              {/* Optician Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.selectOptician}
                </h2>

                <select
                  value={selectedOptician}
                  onChange={(e) => setSelectedOptician(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition text-base"
                >
                  <option value="">{t.selectOptician}</option>
                  {opticians.map((optician) => (
                    <option key={optician.id} value={optician.id}>
                      {optician.businessName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div className="border-t pt-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                    {t.orderItems}
                  </h2>
                  <button
                    type="button"
                    onClick={addOrderLine}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-burning-flame text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t.addOrderLine}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.productLabel}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.currentStock}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.quantityLabel}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                            {t.noProductsAvailable}
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <select
                                value={item.productId}
                                onChange={(e) => updateOrderItem(index, "productId", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                              >
                                <option value="">{t.selectGender}</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} ({product.reference})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              {item.productId ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {getProduct(item.productId)?.stockQty ?? 0}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeOrderLine(index)}
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-sm transition"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t.removeLine}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">{t.manualOrderHelper}</p>
              </div>

              {/* Order Note */}
              <div className="border-t pt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.orderNoteLabel}
                </h2>

                <textarea
                  rows={3}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={t.orderNotePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            <div className="border-t bg-gray-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                onClick={() => router.push("/admin/orders")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-burning-flame hover:bg-orange-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t.submitOrder}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
