"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import { Check, X, ArrowLeft, BarChart3, Package, Clock, Star, Plus, Minus } from "lucide-react"

interface OpticianAnalytics {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  rejectedOrders: number
  cancelledOrders: number
  totalItemsValidated: number
  lastOrderAt: string | null
  lastOrderStatus: string | null
}

interface OpticianDetail {
  id: string
  businessName: string
  firstName: string
  lastName: string
  phone: string
  email: string
  whatsapp?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  latitude?: number | null
  longitude?: number | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  loyaltyPoints?: number
  createdAt: string
  analytics?: OpticianAnalytics
}

export default function AdminOpticianDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const getText = (key: string, fallback: string) => (t as Record<string, string | undefined>)[key] ?? fallback
  const [optician, setOptician] = useState<OpticianDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [pointsToModify, setPointsToModify] = useState<number>(0)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [pointsAction, setPointsAction] = useState<'add' | 'decrease'>('add')

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchOptician()
  }, [status, session, id, router])

  const fetchOptician = async () => {
    try {
      const res = await fetch(`/api/admin/opticians/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOptician(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/opticians/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOptician((prev) => (prev ? { ...prev, status: newStatus } : prev))
      }
    } catch {}
  }

  const handleUpdatePoints = async () => {
    if (!pointsToModify || pointsToModify <= 0) return

    try {
      const res = await fetch(`/api/admin/opticians/${id}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          points: pointsAction === 'add' ? pointsToModify : -pointsToModify 
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setOptician((prev) => (prev ? { ...prev, loyaltyPoints: data.loyaltyPoints } : prev))
        setShowPointsModal(false)
        setPointsToModify(0)
      }
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

  const getStatusBadge = (s: string) => {
    const styles = {
      PENDING: "bg-burning-flame/20 text-burning-flame border border-burning-flame/30",
      APPROVED: "bg-green-50 text-green-700 border border-green-200",
      REJECTED: "bg-red-50 text-red-700 border border-red-200",
    } as const
    return styles[s as keyof typeof styles] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palladian to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin/opticians">
          <Button variant="outline" size="sm" className="mb-8 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-burning-flame"></div>
          </div>
        ) : optician ? (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-abyssal mb-2">{optician.businessName}</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {getText("registrationDate", "Registered on")}: {new Date(optician.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-semibold text-lg ${getStatusBadge(optician.status)}`}>
                  {optician.status === "PENDING" ? t.pending : optician.status === "APPROVED" ? t.approved : t.rejected}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-abyssal mb-4">{t.contactInfo}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">{t.name}</p>
                      <p className="text-gray-900">
                        {optician.firstName} {optician.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">{t.phone}</p>
                      <p className="text-gray-900">{optician.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">{t.email}</p>
                      <p className="text-gray-900">{optician.email}</p>
                    </div>
                    {optician.whatsapp && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t.whatsapp}</p>
                        <p className="text-gray-900">{optician.whatsapp}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-abyssal mb-4">{t.address}</h3>
                  <div className="space-y-3">
                    {optician.address && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t.address}</p>
                        <p className="text-gray-900">{optician.address}</p>
                      </div>
                    )}
                    {optician.city && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t.city}</p>
                        <p className="text-gray-900">{optician.city}</p>
                      </div>
                    )}
                    {optician.postalCode && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t.postalCode}</p>
                        <p className="text-gray-900">{optician.postalCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {optician.status === "PENDING" && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => handleStatusChange("APPROVED")}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    {t.approve}
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("REJECTED")}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    {t.reject}
                  </Button>
                </div>
              )}
            </div>

            {/* Loyalty Points Management */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#f56a24]/20 rounded-lg">
                    <Star className="h-6 w-6 text-[#f56a24]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-abyssal">{t.loyaltyPoints}</h2>
                    <p className="text-sm text-gray-600">{t.currentPoints}</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-[#f56a24]">
                  {optician.loyaltyPoints || 0}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setPointsAction('add')
                    setShowPointsModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  {t.addPoints}
                </Button>
                <Button
                  onClick={() => {
                    setPointsAction('decrease')
                    setShowPointsModal(true)
                  }}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Minus className="h-4 w-4" />
                  {t.decreasePoints}
                </Button>
              </div>
            </div>

            {optician.analytics && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-burning-flame/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-burning-flame" />
                  </div>
                  <h2 className="text-2xl font-bold text-abyssal">{t.analytics}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {(
                    [
                      {
                        label: t.totalOrders,
                        value: optician.analytics.totalOrders,
                        icon: Package,
                        color: "bg-blue-fantastic/20 text-blue-fantastic",
                      },
                      {
                        label: t.approved || "Approved",
                        value: optician.analytics.approvedOrders,
                        icon: Check,
                        color: "bg-green-50 text-green-600",
                      },
                      {
                        label: t.pending || "Pending",
                        value: optician.analytics.pendingOrders,
                        icon: Clock,
                        color: "bg-burning-flame/20 text-burning-flame",
                      },
                      {
                        label: t.rejected || "Rejected",
                        value: optician.analytics.rejectedOrders,
                        icon: X,
                        color: "bg-red-50 text-red-600",
                      },
                    ] as const
                  ).map((card) => (
                    <div
                      key={card.label}
                      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-fantastic hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                        <div className={`p-2 rounded-lg ${card.color}`}>
                          <card.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-abyssal">{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-burning-flame">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-burning-flame" />
                      <p className="text-sm text-gray-600 font-medium">
                        {t.totalItemsValidated}
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-abyssal">{optician.analytics.totalItemsValidated}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-fantastic">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-fantastic" />
                      <p className="text-sm text-gray-600 font-medium">{t.lastOrder}</p>
                    </div>
                    {optician.analytics.lastOrderAt ? (
                      <>
                        <p className="text-lg font-semibold text-abyssal">
                          {new Date(optician.analytics.lastOrderAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {t.status}: {optician.analytics.lastOrderStatus ?? t.pending ?? "Pending"}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600">{t.noOrdersYet}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">{t.opticianNotFound}</div>
        )}
      </div>

      {/* Points Update Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-abyssal mb-4">
              {pointsAction === 'add' ? t.addPoints : t.decreasePoints}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.pointsAmount}
              </label>
              <input
                type="number"
                min="1"
                value={pointsToModify}
                onChange={(e) => setPointsToModify(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f56a24]"
                placeholder="0"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowPointsModal(false)
                  setPointsToModify(0)
                }}
                variant="outline"
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleUpdatePoints}
                className="flex-1 bg-[#f56a24] hover:bg-[#d85a1f]"
                disabled={!pointsToModify || pointsToModify <= 0}
              >
                {t.updatePoints}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
