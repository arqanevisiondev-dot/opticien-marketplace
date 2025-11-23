"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface ProductOption {
  id: string
  type: string
  value: string
}

export default function SettingsPage() {
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<ProductOption[]>([])
  const [genders, setGenders] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [newMaterial, setNewMaterial] = useState("")
  const [newGender, setNewGender] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchOptions()
  }, [session, status, router])

  const fetchOptions = async () => {
    try {
      const [materialsRes, gendersRes] = await Promise.all([
        fetch("/api/admin/product-options?type=material"),
        fetch("/api/admin/product-options?type=gender"),
      ])

      if (materialsRes.ok) {
        const data = await materialsRes.json()
        setMaterials(data)
      }
      if (gendersRes.ok) {
        const data = await gendersRes.json()
        setGenders(data)
      }
    } catch (error) {
      console.error("Error fetching options:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.trim()) return

    try {
      const res = await fetch("/api/admin/product-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "material", value: newMaterial.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSuccess(t.optionAdded)
      setNewMaterial("")
      fetchOptions()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleAddGender = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGender.trim()) return

    try {
      const res = await fetch("/api/admin/product-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gender", value: newGender.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSuccess(t.optionAdded)
      setNewGender("")
      fetchOptions()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/product-options/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setSuccess(t.optionDeleted)
      fetchOptions()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
      setTimeout(() => setError(""), 3000)
    }
  }

  if (status === "loading" || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-6 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-abyssal mb-2">{t.productOptions}</h1>
          <p className="text-sm text-gray-500 mb-6">{t.manageOptions}</p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Materials Section */}
            <div>
              <h2 className="text-2xl font-bold text-abyssal mb-6 pb-3 border-b-2 border-burning-flame">
                {t.materials}
              </h2>

              <form onSubmit={handleAddMaterial} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder={t.materialName}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                  />
                  <Button type="submit" className="bg-burning-flame hover:bg-burning-flame/90">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addOption}
                  </Button>
                </div>
              </form>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-burning-flame"></div>
                </div>
              ) : materials.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">{t.noMaterials}</p>
              ) : (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <span className="font-medium text-gray-900">{material.value}</span>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Genders Section */}
            <div>
              <h2 className="text-2xl font-bold text-abyssal mb-6 pb-3 border-b-2 border-burning-flame">{t.genders}</h2>

              <form onSubmit={handleAddGender} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    placeholder={t.genderName}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                  />
                  <Button type="submit" className="bg-burning-flame hover:bg-burning-flame/90">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addOption}
                  </Button>
                </div>
              </form>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-burning-flame"></div>
                </div>
              ) : genders.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">{t.noGenders}</p>
              ) : (
                <div className="space-y-2">
                  {genders.map((gender) => (
                    <div
                      key={gender.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <span className="font-medium text-gray-900">{gender.value}</span>
                      <button
                        onClick={() => handleDelete(gender.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong className="text-blue-900">Note:</strong> {t.productOptions} will be available when creating or
              modifying products. Existing product options remain unchanged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
