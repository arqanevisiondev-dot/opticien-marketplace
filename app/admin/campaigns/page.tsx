"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft, Send, Users, MessageSquare } from "lucide-react"

interface Recipient {
  id: string
  businessName: string
  firstName: string
  lastName: string
  whatsapp: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function WhatsappCampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(true)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    ;(async () => {
      const res = await fetch("/api/admin/opticians/whatsapp-recipients")
      if (res.ok) {
        const data = (await res.json()) as Recipient[]
        setRecipients(data)
        const init: Record<string, boolean> = {}
        data.forEach((r) => (init[r.id] = true))
        setSelected(init)
        setSelectAll(true)
      }
    })()
  }, [status, session, router])

  const toggleAll = (checked: boolean) => {
    setSelectAll(checked)
    const next: Record<string, boolean> = {}
    recipients.forEach((r) => (next[r.id] = checked))
    setSelected(next)
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const recipientIds = selectAll
        ? []
        : Object.entries(selected)
            .filter(([, v]) => v)
            .map(([k]) => k)

      const res = await fetch("/api/admin/campaigns/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, recipientIds }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult({ success: data.success, failed: data.failed })
        setMessage("")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palladian to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-8 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-burning-flame/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-burning-flame" />
            </div>
            <h1 className="text-4xl font-bold text-abyssal">{t.whatsappCampaigns}</h1>
          </div>
          <p className="text-gray-600 ml-11">
            {recipients.length} {t.recipientsAvailable}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border-l-4 border-burning-flame rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{t.totalRecipients}</p>
                <p className="text-3xl font-bold text-abyssal">{recipients.length}</p>
              </div>
              <Users className="h-12 w-12 text-burning-flame/30" />
            </div>
          </div>
          <div className="bg-white border-l-4 border-blue-fantastic rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{t.selectedRecipients}</p>
                <p className="text-3xl font-bold text-abyssal">
                  {selectAll ? recipients.length : Object.values(selected).filter(Boolean).length}
                </p>
              </div>
              <Send className="h-12 w-12 text-blue-fantastic/30" />
            </div>
          </div>
        </div>

        {/* Message Composition */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-abyssal mb-6">Composer le message</h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-abyssal mb-3">{t.message}</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg p-4 h-40 focus:outline-none focus:border-burning-flame focus:ring-2 focus:ring-burning-flame/20 resize-none transition-all"
              placeholder={t.writeWhatsAppMessagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="text-right text-sm text-gray-500 mt-2">{message.length} caractères</div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                className="h-5 w-5 text-burning-flame rounded"
                checked={selectAll}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span className="font-medium text-abyssal">{t.selectAllOpticians}</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? t.sending : t.sendViaWhatsApp}
            </Button>
          </div>
        </div>

        {/* Recipients List */}
        {!selectAll && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-abyssal mb-6">{t.recipients}</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {recipients.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-burning-flame rounded"
                    checked={!!selected[r.id]}
                    onChange={(e) => toggleOne(r.id, e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-abyssal">{r.businessName}</div>
                    <div className="text-sm text-gray-600">
                      {r.firstName} {r.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{r.whatsapp}</div>
                  </div>
                </label>
              ))}
              {recipients.length === 0 && (
                <div className="text-center py-8 text-gray-500">{t.noOpticiansWithWhatsApp}</div>
              )}
            </div>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-abyssal mb-4">Résultats d'envoi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">{t.sentSuccessfully}</p>
                <p className="text-3xl font-bold text-green-600">{result.success}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm font-medium mb-1">{t.failed}</p>
                <p className="text-3xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
