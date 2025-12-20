"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ImageIcon,
  FileText,
} from "lucide-react"

interface Recipient {
  id: string
  businessName: string
  firstName: string
  lastName: string
  email?: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function EmailCampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(true)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    ;(async () => {
      const res = await fetch("/api/admin/opticians/email-recipients")
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
    if (!message.trim() || !subject.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const recipientIds = selectAll
        ? []
        : Object.entries(selected)
            .filter(([, v]) => v)
            .map(([k]) => k)

      const res = await fetch("/api/admin/campaigns/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          contentHtml: message.trim(),
          recipientIds,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult({ success: data.success ?? data.sent ?? data.attempted ?? 0, failed: data.failed ?? 0 })
        setSubject("")
        setMessage("")
        setUploadedUrl(null)
        setUploadedFileName(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    setUploading(true)
    setUploadedUrl(null)
    setUploadedFileName(null)

    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/admin/campaigns/upload", { method: "POST", body: fd })

      if (res.ok) {
        const data = await res.json()
        setUploadedUrl(data.url)
        setUploadedFileName(f.name)
      } else {
        const err = await res.json().catch(() => null)
        alert(err?.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedFile = () => {
    setUploadedUrl(null)
    setUploadedFileName(null)
    const fileInput = document.getElementById("campaign-file") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const selectedCount = selectAll ? recipients.length : Object.values(selected).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t.backToDashboard}</span>
              <span className="sm:hidden">Retour</span>
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Mail className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t.emailCampaignsTitle ?? "Campagnes Email"}
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {recipients.length} {t.recipientsAvailable ?? "destinataires disponibles"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    {t.totalRecipients ?? "Total destinataires"}
                  </p>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">{recipients.length}</p>
                </div>
                <div className="p-3 md:p-4 bg-blue-50 rounded-xl">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    {t.selectedRecipients ?? "Destinataires sélectionnés"}
                  </p>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">{selectedCount}</p>
                </div>
                <div className="p-3 md:p-4 bg-green-50 rounded-xl">
                  <Send className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl mb-6 md:mb-8">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-2xl">{t.composeMessage ?? "Composer le message"}</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Créez votre campagne email personnalisée
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Subject Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t.subjectLabel ?? "Objet"}
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl p-3 md:p-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm md:text-base"
                placeholder={t.subjectPlaceholder ?? "Entrez l'objet de l'email"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t.messageLabel ?? "Message"}
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-3 md:p-4 h-40 md:h-48 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all text-sm md:text-base"
                placeholder={t.emailMessagePlaceholder ?? "Rédigez votre message ici..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs md:text-sm text-gray-500">{message.length} caractères</div>
                {message.length > 1000 && (
                  <div className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Message long
                  </div>
                )}
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Joindre un fichier (optionnel)
              </label>

              {!uploadedUrl ? (
                <div className="space-y-3">
                  <label
                    htmlFor="campaign-file"
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                      <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                        Cliquez pour télécharger
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (Max 5MB)</p>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="campaign-file"
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Téléchargement...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-green-200 p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{uploadedFileName}</p>
                      {uploadedFileType?.startsWith('image/') && (
                        <img src={uploadedUrl ?? ''} alt={uploadedFileName ?? ''} className="mt-2 max-h-48 rounded-md" />
                      )}
                      {uploadedFileType?.startsWith('video/') && (
                        <video controls src={uploadedUrl ?? ''} className="mt-2 max-h-56 rounded-md w-full" />
                      )}
                      {!uploadedFileType?.startsWith('image/') && !uploadedFileType?.startsWith('video/') && (
                        <a
                          href={uploadedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Voir le fichier
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={removeUploadedFile}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const insert = `\n\nPièce jointe: ${uploadedUrl}\n`
                      setMessage((m) => m + insert)
                    }}
                    className="w-full mt-3 text-xs md:text-sm"
                  >
                    Insérer le lien dans le message
                  </Button>
                </div>
              )}
            </div>

            {/* Recipients Selection */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  checked={selectAll}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                <span className="font-medium text-gray-900 text-sm md:text-base group-hover:text-blue-700 transition-colors">
                  {t.selectAllOpticians ?? "Envoyer à tous les opticiens"}
                </span>
              </label>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim() || !subject.trim() || selectedCount === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-5 md:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t.sending ?? "Envoi en cours..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  <span>
                    {t.sendEmails ?? `Envoyer à ${selectedCount} destinataire${selectedCount > 1 ? "s" : ""}`}
                  </span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {!selectAll && (
          <Card className="shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t.recipients ?? "Destinataires"} ({selectedCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {recipients.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-3 p-3 md:p-4 hover:bg-blue-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 group"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      checked={!!selected[r.id]}
                      onChange={(e) => toggleOne(r.id, e.target.checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-blue-700 transition-colors">
                        {r.businessName}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {r.firstName} {r.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{r.email ?? "—"}</div>
                    </div>
                  </label>
                ))}
                {recipients.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t.noOpticiansWithEmail ?? "Aucun opticien avec email trouvé."}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Alert className="mt-6 md:mt-8 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription>
              <div className="space-y-3">
                <h3 className="text-base md:text-lg font-bold text-green-900">
                  {t.sendResults ?? "Résultats de l'envoi"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-green-200">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">
                      {t.sentSuccessfully ?? "Envoyés avec succès"}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">{result.success}</p>
                  </div>
                  {result.failed > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-red-200">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">{t.failed ?? "Échecs"}</p>
                      <p className="text-2xl md:text-3xl font-bold text-red-600">{result.failed}</p>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
