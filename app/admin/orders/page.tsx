"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ClipboardList, CheckCircle2, Clock3, Ban, Coins, RotateCcw, Package, Gift } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
type OrderSource = "MANUAL" | "WHATSAPP"
type RedemptionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

interface OrdersSummary {
  totalOrders: number
  totalArticles: number
  pending: number
  approved: number
  cancelled: number
  totalValue: number
}

interface OrderRow {
  id: string
  status: OrderStatus
  source: OrderSource
  totalAmount: number
  currency: string
  createdAt: string
  validatedAt?: string | null
  optician: {
    id: string
    name: string
    city: string | null
  }
  itemCount: number
}

interface LoyaltyRedemptionRow {
  id: string
  status: RedemptionStatus
  totalPoints: number
  createdAt: string
  approvedAt?: string | null
  rejectedAt?: string | null
  optician: {
    id: string
    name: string
    city: string | null
    email: string
  }
  itemCount: number
  items: Array<{
    id: string
    productName: string
    quantity: number
    pointsCost: number
    totalPoints: number
    imageUrl?: string | null
  }>
}

interface LoyaltyRedemptionsSummary {
  totalRedemptions: number
  totalPoints: number
  pending: number
  approved: number
  rejected: number
  totalItems: number
}

const INITIAL_SUMMARY: OrdersSummary = {
  totalOrders: 0,
  totalArticles: 0,
  pending: 0,
  approved: 0,
  cancelled: 0,
  totalValue: 0,
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language } = useLanguage()

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loyaltyRedemptions, setLoyaltyRedemptions] = useState<LoyaltyRedemptionRow[]>([])
  const [summary, setSummary] = useState<OrdersSummary>(INITIAL_SUMMARY)
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltyRedemptionsSummary>({
    totalRedemptions: 0,
    totalPoints: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"regular" | "loyalty">("regular")

  const locale = useMemo(() => {
    if (language === "fr") return "fr-FR"
    if (language === "ar") return "ar-EG"
    return "en-US"
  }, [language])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [ordersRes, redemptionsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/loyalty-redemptions"),
      ])

      if (!ordersRes.ok) {
        throw new Error("Failed to load orders")
      }

      const ordersData = await ordersRes.json()
      const fetchedOrders: OrderRow[] = Array.isArray(ordersData.orders) ? ordersData.orders : []
      setOrders(fetchedOrders)

      const summaryData = ordersData?.summary || {}
      setSummary({
        totalOrders: summaryData.totalOrders ?? 0,
        totalArticles: summaryData.totalArticles ?? 0,
        pending: summaryData.pending ?? 0,
        approved: summaryData.approved ?? 0,
        cancelled: summaryData.cancelled ?? 0,
        totalValue: summaryData.totalValue ?? 0,
      })

      if (redemptionsRes.ok) {
        const redemptionsData = await redemptionsRes.json()
        setLoyaltyRedemptions(redemptionsData.redemptions || [])
        setLoyaltySummary(redemptionsData.summary || {
          totalRedemptions: 0,
          totalPoints: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalItems: 0,
        })
      }
    } catch (err) {
      console.error(err)
      setError(t.orderDataLoadError)
    } finally {
      setLoading(false)
    }
  }, [t.orderDataLoadError])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    loadOrders()
  }, [session, status, router, loadOrders])

  const formatCurrency = (amount: number) => {
    // Always display in DH (Moroccan Dirham)
    return `${amount.toFixed(2)} DH`
  }

  const formatDateTime = (value: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const statusLabels: Record<OrderStatus, string> = {
    PENDING: t.pending,
    APPROVED: t.approved,
    REJECTED: t.rejected,
    CANCELLED: t.cancelled,
  }

  const redemptionStatusLabels: Record<RedemptionStatus, string> = {
    PENDING: t.pending,
    APPROVED: t.approved,
    REJECTED: t.rejected,
    CANCELLED: t.cancelled,
  }

  const statusStyles: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-200 text-gray-700",
  }

  const redemptionStatusStyles: Record<RedemptionStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-200 text-gray-700",
  }

  const sourceLabels: Record<OrderSource, string> = {
    MANUAL: t.sourceManual,
    WHATSAPP: t.sourceWhatsapp,
  }

  const summaryCards = [
    {
      label: t.ordersSummaryTotal,
      value: summary.totalArticles.toLocaleString(locale),
      icon: ClipboardList,
      color: "bg-burning-flame",
    },
    {
      label: t.ordersSummaryPending,
      value: summary.pending.toLocaleString(locale),
      icon: Clock3,
      color: "bg-truffle-trouble",
    },
    {
      label: t.ordersSummaryApproved,
      value: summary.approved.toLocaleString(locale),
      icon: CheckCircle2,
      color: "bg-blue-fantastic",
    },
    {
      label: t.ordersSummaryCancelled,
      value: summary.cancelled.toLocaleString(locale),
      icon: Ban,
      color: "bg-abyssal",
    },
    {
      label: t.ordersSummaryValue,
      value: formatCurrency(summary.totalValue),
      icon: Coins,
      color: "bg-burning-flame",
    },
  ]

  const loyaltySummaryCards = [
    {
      label: t.loyaltyExchangesTotal,
      value: loyaltySummary.totalRedemptions.toLocaleString(locale),
      icon: Gift,
      color: "bg-burning-flame",
    },
    {
      label: t.loyaltyItemsLabel,
      value: loyaltySummary.totalItems.toLocaleString(locale),
      icon: Package,
      color: "bg-blue-fantastic",
    },
    {
      label: t.loyaltyPendingLabel,
      value: loyaltySummary.pending.toLocaleString(locale),
      icon: Clock3,
      color: "bg-truffle-trouble",
    },
    {
      label: t.loyaltyApprovedLabel,
      value: loyaltySummary.approved.toLocaleString(locale),
      icon: CheckCircle2,
      color: "bg-blue-fantastic",
    },
    {
      label: t.loyaltyTotalPointsLabel,
      value: loyaltySummary.totalPoints.toLocaleString(locale),
      icon: Coins,
      color: "bg-burning-flame",
    },
  ]

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-abyssal sm:text-4xl">{t.ordersPageTitle}</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">{t.ordersPageSubtitle}</p>
          </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={loadOrders}
                disabled={loading}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" />
                {t.refresh}
              </Button>
            </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {(activeTab === "regular" ? summaryCards : loyaltySummaryCards).map((card) => (
            <div key={card.label} className="bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className={`${card.color} flex h-10 w-10 items-center justify-center rounded-full`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-abyssal">{card.value}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("regular")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "regular"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
              <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.regularOrdersLabel} ({summary.totalOrders})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "loyalty"
                ? "text-[#f56a24] border-b-2 border-[#f56a24]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
              <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t.loyaltyTabLabel} ({loyaltySummary.totalRedemptions})
            </div>
          </button>
        </div>

        {activeTab === "regular" ? (
        <div className="mt-0 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-abyssal">{t.ordersTableTitle}</h2>
              <p className="text-sm text-gray-500">
                {t.ordersSummaryTotal}: {summary.totalArticles.toLocaleString(locale)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-6 py-3">{t.orderIdLabel}</th>
                  <th className="px-6 py-3">{t.orderOptician}</th>
                  <th className="px-6 py-3">{t.orderItemsCount}</th>
                  <th className="px-6 py-3">{t.orderTotal}</th>
                  <th className="px-6 py-3">{t.orderCreated}</th>
                  <th className="px-6 py-3">{t.orderStatus}</th>
                  <th className="px-6 py-3">{t.orderSource}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      {t.loading}
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      {t.ordersTableEmpty}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-abyssal">{order.id}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="font-medium">{order.optician.name}</div>
                        {order.optician.city && (
                          <div className="text-xs text-gray-500">{order.optician.city}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{order.itemCount.toLocaleString(locale)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDateTime(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{sourceLabels[order.source]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
        <div className="mt-0 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-[#f56a24]">{t.loyaltyHistoryTitle}</h2>
              <p className="text-sm text-gray-500">
                {t.loyaltyExchangesTotal}: {loyaltySummary.totalRedemptions.toLocaleString(locale)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-orange-50">
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Opticien</th>
                  <th className="px-6 py-3">Articles</th>
                  <th className="px-6 py-3">Points</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {t.loading}
                    </td>
                  </tr>
                ) : loyaltyRedemptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {t.noLoyaltyRedemptions}
                    </td>
                  </tr>
                ) : (
                  loyaltyRedemptions.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-orange-50/50">
                      <td className="px-6 py-4 font-medium text-abyssal">{redemption.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="font-medium">{redemption.optician.name}</div>
                        {redemption.optician.city && (
                          <div className="text-xs text-gray-500">{redemption.optician.city}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{redemption.itemCount.toLocaleString(locale)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <span className="font-semibold text-[#f56a24]">{redemption.totalPoints.toLocaleString(locale)} pts</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDateTime(redemption.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${redemptionStatusStyles[redemption.status]}`}
                        >
                          {redemptionStatusLabels[redemption.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
