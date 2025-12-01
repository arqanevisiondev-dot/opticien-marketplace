"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import { Check, X, ArrowLeft, BarChart3, Package, Clock } from "lucide-react"

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

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/opticians/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOptician(data)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [status, session, id, router])

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
    </div>
  )
}
