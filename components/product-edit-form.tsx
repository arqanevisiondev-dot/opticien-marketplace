"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Upload, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

interface ProductEditFormProps {
  productId: string
}

interface CategoryOption {
  id: string
  name: string
}

interface ProductOptionItem {
  id: string
  value: string
}

const emptyForm = {
  name: "",
  reference: "",
  description: "",
  categoryId: "",
  material: "",
  gender: "",
  shape: "",
  color: "",
  price: "",
  salePrice: "",
  stockQty: "",
  firstOrderRemisePct: "",
  images: "",
  inStock: true,
  isNewCollection: false,
}

export default function ProductEditForm({ productId }: ProductEditFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState(emptyForm)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [materials, setMaterials] = useState<ProductOptionItem[]>([])
  const [genders, setGenders] = useState<ProductOptionItem[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, materialsRes, gendersRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/admin/product-options?type=material"),
          fetch("/api/admin/product-options?type=gender"),
        ])
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data)
        }
        if (materialsRes.ok) {
          const data = await materialsRes.json()
          setMaterials(data)
        }
        if (gendersRes.ok) {
          const data = await gendersRes.json()
          setGenders(data)
        }
      } catch (err) {
        console.error("Error fetching options:", err)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchOptions()
    }
  }, [session])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      setLoadingData(true)
      try {
        const res = await fetch(`/api/admin/products?id=${productId}`)
        if (!res.ok) {
          throw new Error("failed")
        }
        const data = await res.json()
        const product = data.product
        setFormData({
          name: product.name ?? "",
          reference: product.reference ?? "",
          description: product.description ?? "",
          categoryId: product.categoryId ?? "",
          material: product.material ?? "",
          gender: product.gender ?? "",
          shape: product.shape ?? "",
          color: product.color ?? "",
          price: String(product.price ?? ""),
          salePrice: product.salePrice != null ? String(product.salePrice) : "",
          stockQty: product.stockQty != null ? String(product.stockQty) : "",
          firstOrderRemisePct: product.firstOrderRemisePct != null ? String(product.firstOrderRemisePct) : "",
          images: "",
          inStock: product.inStock ?? true,
          isNewCollection: product.isNewCollection ?? false,
        })
        setExistingImages(Array.isArray(product.images) ? product.images : [])
      } catch (err) {
        console.error(err)
        setError(t.errorLoadingProduct)
      } finally {
        setLoadingData(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchProduct()
    }
  }, [productId, session, t])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImagePreview = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      return t.requiredField
    }
    if (!formData.reference.trim()) {
      return t.requiredField
    }
    const price = Number.parseFloat(formData.price)
    if (Number.isNaN(price) || price <= 0) {
      return t.invalidPrice
    }
    if (formData.salePrice.trim()) {
      const sale = Number.parseFloat(formData.salePrice)
      if (Number.isNaN(sale) || sale <= 0) {
        return t.invalidPrice
      }
    }
    if (formData.stockQty.trim()) {
      const stock = Number.parseInt(formData.stockQty, 10)
      if (Number.isNaN(stock) || stock < 0) {
        return t.invalidQuantity
      }
    }
    if (formData.firstOrderRemisePct.trim()) {
      const remise = Number.parseFloat(formData.firstOrderRemisePct)
      if (Number.isNaN(remise) || remise < 0 || remise > 100) {
        return t.invalidRemise
      }
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)

    try {
      let newImages: string[] = []
      if (imageFiles.length > 0) {
        newImages = await Promise.all(
          imageFiles.map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
              }),
          ),
        )
      }

      const manualImages = formData.images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url)

      const payload = {
        id: productId,
        ...formData,
        price: Number.parseFloat(formData.price),
        salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : null,
        stockQty: formData.stockQty ? Number.parseInt(formData.stockQty, 10) : 0,
        firstOrderRemisePct: formData.firstOrderRemisePct ? Number.parseFloat(formData.firstOrderRemisePct) : null,
        images: [...existingImages, ...manualImages, ...newImages],
      }

      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t.errorSavingProduct)
      }

      router.push("/admin/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorSavingProduct)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-palladian py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/products"
          className="mb-6 inline-flex items-center text-sm font-medium text-burning-flame hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.backToDashboard}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-abyssal mb-2">{t.editProductTitle}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t.editProductSubtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">{t.error}</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center gap-3 text-gray-500 py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.basicInfo}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder={t.productName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.productReference} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder={t.productReference}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.productDescription}</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition resize-none"
                    placeholder={t.productDescription}
                  />
                </div>
              </div>

              {/* Category Section */}
              <div className="border-t pt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.categorization}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                    >
                      <option value="">{t.selectCategory}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.productMaterial}</label>
                    <select
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                    >
                      <option value="">{t.selectMaterial}</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.value}>
                          {material.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.productGender}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                    >
                      <option value="">{t.selectGender}</option>
                      {genders.map((gender) => (
                        <option key={gender.id} value={gender.value}>
                          {gender.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.productShape}</label>
                    <input
                      type="text"
                      value={formData.shape}
                      onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder={t.productShape}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.productColor}</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder={t.productColor}
                    />
                    <p className="text-xs text-gray-500 mt-2">{t.colorNote}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border-t pt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.pricingInventory}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.price} (DH) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder="99.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.salePrice} (DH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder="89.99"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.salePriceHint}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.stockQuantity}</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.firstOrderRemisePct} (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.firstOrderRemisePct}
                      onChange={(e) => setFormData({ ...formData, firstOrderRemisePct: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent transition"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.remiseHint}</p>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border-t pt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-burning-flame rounded-full"></div>
                  {t.productImages}
                </h2>

                <div>
                  <label className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-burning-flame hover:bg-orange-50 transition-all">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-burning-flame">{t.clickUpload}</span> {t.orDragDrop}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{t.imageFormats}</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-burning-flame"
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t bg-gray-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                onClick={() => router.push("/admin/products")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-burning-flame hover:bg-orange-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t.save}
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
