"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import { Check, X, Eye, Search, Store, UsersIcon, ArrowLeft } from "lucide-react"

interface Optician {
  id: string
  businessName: string
  firstName: string
  lastName: string
  phone: string
  email: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

export default function AdminOpticiansPage() {
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [opticians, setOpticians] = useState<Optician[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchOpticians()
  }, [session, status, router])

  const fetchOpticians = async () => {
    try {
      const res = await fetch("/api/admin/opticians")
      const data = await res.json()
      setOpticians(data)
    } catch (error) {
      console.error("Error fetching opticians:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/opticians/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOpticians(opticians.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
      }
    } catch (error) {
      console.error("Error updating optician status:", error)
    }
  }

  const filteredOpticians = opticians.filter((o) => {
    const matchesFilter = filter === "ALL" || o.status === filter
    const matchesSearch =
      o.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-burning-flame/20 text-burning-flame border border-burning-flame/30",
      APPROVED: "bg-green-50 text-green-700 border border-green-200",
      REJECTED: "bg-red-50 text-red-700 border border-red-200",
    }
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"
  }

  const statsByStatus = {
    PENDING: opticians.filter((o) => o.status === "PENDING").length,
    APPROVED: opticians.filter((o) => o.status === "APPROVED").length,
    REJECTED: opticians.filter((o) => o.status === "REJECTED").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palladian to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-8 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-burning-flame/20 rounded-lg">
              <Store className="h-8 w-8 text-burning-flame" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-abyssal">{t.opticianManagement}</h1>
              <p className="text-gray-600 mt-1">{opticians.length} {t.opticiansTotal}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-burning-flame">
            <p className="text-gray-600 text-sm font-medium mb-1">{t.pending}</p>
            <p className="text-3xl font-bold text-burning-flame">{statsByStatus.PENDING}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium mb-1">{t.approved}</p>
            <p className="text-3xl font-bold text-green-600">{statsByStatus.APPROVED}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium mb-1">{t.rejected}</p>
            <p className="text-3xl font-bold text-red-600">{statsByStatus.REJECTED}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchOptician}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-burning-flame focus:ring-2 focus:ring-burning-flame/20 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="transition-all"
              >
                {status === "ALL"
                  ? t.all
                  : status === "PENDING"
                    ? t.pending
                    : status === "APPROVED"
                      ? t.approved
                      : t.rejected}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-burning-flame"></div>
            </div>
          ) : filteredOpticians.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {t.noOpticianFound}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-abyssal to-blue-fantastic text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.business}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.contactInfo}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.email}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.status}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOpticians.map((optician, index) => (
                    <tr
                      key={optician.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-abyssal">{optician.businessName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {optician.firstName} {optician.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{optician.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{optician.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(optician.status)}`}
                        >
                          {optician.status === "PENDING"
                            ? t.pending
                            : optician.status === "APPROVED"
                              ? t.approved
                              : t.rejected}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {optician.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(optician.id, "APPROVED")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title={t.approve}
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(optician.id, "REJECTED")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t.reject}
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/admin/opticians/${optician.id}`)}
                            className="p-2 text-blue-fantastic hover:bg-blue-fantastic/10 rounded-lg transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
