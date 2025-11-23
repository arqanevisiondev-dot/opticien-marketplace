"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ClipboardList, CheckCircle2, Clock3, Ban, Coins, PlusCircle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
type OrderSource = "MANUAL" | "WHATSAPP"

interface OrdersSummary {
  totalOrders: number
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

const INITIAL_SUMMARY: OrdersSummary = {
  totalOrders: 0,
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
  const [summary, setSummary] = useState<OrdersSummary>(INITIAL_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currency, setCurrency] = useState("EUR")

  const locale = useMemo(() => {
    if (language === "fr") return "fr-FR"
    if (language === "ar") return "ar-EG"
    return "en-US"
  }, [language])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/orders")
      if (!res.ok) {
        throw new Error("Failed to load orders")
      }

      const data = await res.json()
      const fetchedOrders: OrderRow[] = Array.isArray(data.orders) ? data.orders : []
      setOrders(fetchedOrders)

      const summaryData = data?.summary || {}
      setSummary({
        totalOrders: summaryData.totalOrders ?? 0,
        pending: summaryData.pending ?? 0,
        approved: summaryData.approved ?? 0,
        cancelled: summaryData.cancelled ?? 0,
        totalValue: summaryData.totalValue ?? 0,
      })

      const firstCurrency = fetchedOrders.find((order) => order.currency)?.currency
      setCurrency(firstCurrency ?? "EUR")
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

  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode || "EUR",
      }).format(amount)
    } catch {
      return `${amount.toFixed(2)} ${currencyCode || "EUR"}`
    }
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

  const statusStyles: Record<OrderStatus, string> = {
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
      value: summary.totalOrders.toLocaleString(locale),
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
      value: formatCurrency(summary.totalValue, currency),
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
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t.refresh}
            </Button>
            <Link href="/admin/orders/new">
              <Button className="bg-burning-flame text-white hover:bg-[#f56a24]">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t.newOrder}
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
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

        <div className="mt-10 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-abyssal">{t.ordersTableTitle}</h2>
              <p className="text-sm text-gray-500">
                {t.ordersSummaryTotal}: {summary.totalOrders.toLocaleString(locale)}
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
                        {formatCurrency(order.totalAmount, order.currency || currency)}
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
      </div>
    </div>
  )
}
