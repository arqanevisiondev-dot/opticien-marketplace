"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Search, Package, Tag, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ category: Category; force: boolean } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchCategories()
  }, [session, status, router])

  useEffect(() => {
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
      setFormData({ ...formData, imageUrl: "" })
    }
  }

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview("")
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
        setFilteredCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
        imageUrl: category.imageUrl || "",
      })
      setImagePreview(category.imageUrl || "")
    } else {
      setEditingCategory(null)
      setFormData({ name: "", description: "", imageUrl: "" })
      setImagePreview("")
    }
    setImageFile(null)
    setUploadMethod("url")
    setShowModal(true)
    setError("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "", imageUrl: "" })
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview("")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      let finalImageUrl = formData.imageUrl

      // If file was uploaded, convert to base64
      if (imageFile) {
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories"

      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrl: finalImageUrl }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur")
      }

      setSuccess(editingCategory ? t.categoryUpdated : t.categoryCreated)
      handleCloseModal()
      fetchCategories()

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ category, force: false })
  }

  const handleDelete = async (force = false) => {
    if (!deleteConfirm) return

    try {
      const url = `/api/admin/categories/${deleteConfirm.category.id}${force ? "?force=true" : ""}`
      const res = await fetch(url, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        if (data.canForceDelete) {
          setDeleteConfirm({ ...deleteConfirm, force: true })
          return
        }
        throw new Error(data.error || "Erreur")
      }

      setSuccess(t.categoryDeleted)
      setDeleteConfirm(null)
      fetchCategories()

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  if (status === "loading" || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-palladian to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-8 flex items-center bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-burning-flame/20 rounded-lg">
              <Tag className="h-8 w-8 text-burning-flame" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-abyssal">{t.manageCategories}</h1>
              <p className="text-gray-600 mt-1">{filteredCategories.length} {t.categoriesAvailable}</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.newCategory}
          </Button>
        </div>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 mb-6 rounded-r-lg flex items-center gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            {success}
          </div>
        )}

        {error && !showModal && !deleteConfirm && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 mb-6 rounded-r-lg flex items-center gap-3">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchCategory}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-burning-flame focus:ring-2 focus:ring-burning-flame/20 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-burning-flame"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchQuery ? t.noCategories : t.noCategories}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-abyssal to-blue-fantastic text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.categoryName}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.categoryDescription}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{t.productCount}</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={category.id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-abyssal">{category.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Tag className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">{category.description || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 bg-burning-flame/10 w-fit px-3 py-1 rounded-full">
                          <Package className="h-4 w-4 text-burning-flame" />
                          <span className="font-semibold text-burning-flame">{category._count.products}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2 text-blue-fantastic hover:bg-blue-fantastic/10 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-abyssal mb-6">{editingCategory ? t.editCategory : t.newCategory}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-abyssal mb-2">{t.categoryName} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-burning-flame"
                  placeholder="Montures de soleil"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-abyssal mb-2">{t.categoryDescription}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-burning-flame resize-none"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-abyssal mb-3">{t.categoryImage}</label>
                
                {/* Upload method selector */}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMethod("file")
                      setFormData({ ...formData, imageUrl: "" })
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      uploadMethod === "file"
                        ? "border-burning-flame bg-burning-flame/10 text-burning-flame font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    {t.uploadFile}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMethod("url")
                      removeImage()
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      uploadMethod === "url"
                        ? "border-burning-flame bg-burning-flame/10 text-burning-flame font-semibold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    URL
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <div>
                    {/* File Upload */}
                    {!imagePreview ? (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-burning-flame transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-burning-flame">{t.clickToUpload}</span> {t.dragAndDrop}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{t.fileTypeLimit}</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* URL Input */}
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value })
                        setImagePreview(e.target.value)
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-burning-flame"
                      placeholder="https://example.com/image.jpg"
                    />
                    {imagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">{t.preview}:</p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingCategory ? t.updateCategory : t.createCategory}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 bg-transparent">
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-abyssal mb-4">{t.confirmDelete}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded text-sm">{error}</div>
            )}

            <p className="text-gray-600 mb-4">
              {deleteConfirm.category._count.products > 0 ? (
                <>
                  {t.categoryHasProducts?.replace("{count}", deleteConfirm.category._count.products.toString())}
                  <br />
                  <br />
                  {deleteConfirm.force ? (
                    <span className="text-red-600 font-medium">{t.forceDeleteWarning}</span>
                  ) : (
                    <span className="text-red-600">{t.cannotDeleteCategory}</span>
                  )}
                </>
              ) : (
                `${t.deleteCategory}: "${deleteConfirm.category.name}" ?`
              )}
            </p>

            <div className="flex gap-4">
              {deleteConfirm.force || deleteConfirm.category._count.products === 0 ? (
                <Button
                  onClick={() => handleDelete(deleteConfirm.force)}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteConfirm.force ? t.forceDelete : t.delete}
                </Button>
              ) : (
                <Button
                  onClick={() => setDeleteConfirm({ ...deleteConfirm, force: true })}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {t.forceDelete}
                </Button>
              )}
              <Button
                onClick={() => {
                  setDeleteConfirm(null)
                  setError("")
                }}
                variant="outline"
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
