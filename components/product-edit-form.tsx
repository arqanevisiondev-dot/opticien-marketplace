"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Upload, X, Loader2, Check, Plus } from "lucide-react"
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

interface Brand {
  id: string
  name: string
}

interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (value: string, imageData?: string) => Promise<void>;
  title: string;
  label: string;
  placeholder: string;
  requiresImage?: boolean;
}

function AddOptionModal({ isOpen, onClose, onAdd, title, label, placeholder, requiresImage }: AddOptionModalProps) {
  const [value, setValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    if (requiresImage && uploadType === 'file' && !imageFile) {
      setError('Veuillez sélectionner une image');
      return;
    }
    
    if (requiresImage && uploadType === 'url' && !imageUrl.trim()) {
      setError('Veuillez entrer une URL d\'image');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let imageData = '';
      
      if (requiresImage) {
        if (uploadType === 'file' && imageFile) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          imageData = base64;
        } else if (uploadType === 'url') {
          imageData = imageUrl.trim();
        }
      }
      
      await onAdd(value.trim(), imageData);
      setValue('');
      setImageFile(null);
      setImagePreview('');
      setImageUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent"
              placeholder={placeholder}
              autoFocus
              required
            />
          </div>

          {requiresImage && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image <span className="text-red-500">*</span>
              </label>
              
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadType === 'file'
                      ? 'bg-[#f56a24] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload fichier
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadType === 'url'
                      ? 'bg-[#f56a24] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  URL
                </button>
              </div>

              {uploadType === 'file' ? (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#f56a24] hover:bg-orange-50 transition-all">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Cliquez pour uploader
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex-1"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const emptyForm = {
  name: "",
  reference: "",
  description: "",
  categoryId: "",
  material: "",
  gender: "",
  marque: "",
  shape: "",
  color: "",
  price: "",
  salePrice: "",
  firstOrderRemisePct: "",
  loyaltyPointsReward: "",
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
  const [brands, setBrands] = useState<Brand[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  const [modalState, setModalState] = useState<{
    type: 'category' | 'material' | 'gender' | 'brand' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, materialsRes, gendersRes, brandsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/admin/product-options?type=material"),
          fetch("/api/admin/product-options?type=gender"),
          fetch('/api/admin/brands'),
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
        if (brandsRes.ok) {
          const data = await brandsRes.json()
          setBrands(data)
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
          marque: product.marque ?? "",
          shape: product.shape ?? "",
          color: product.color ?? "",
          price: String(product.price ?? ""),
          salePrice: product.salePrice != null ? String(product.salePrice) : "",
          firstOrderRemisePct: product.firstOrderRemisePct != null ? String(product.firstOrderRemisePct) : "",
          loyaltyPointsReward: product.loyaltyPointsReward != null ? String(product.loyaltyPointsReward) : "",
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

  const handleAddOption = async (value: string, imageData?: string) => {
    const { type } = modalState;
    if (!type) return;

    try {
      let endpoint = '';
      let body = {};

      switch (type) {
        case 'category':
          endpoint = '/api/admin/categories';
          body = { name: value, imageUrl: imageData || '' };
          break;
        case 'material':
          endpoint = '/api/admin/product-options';
          body = { type: 'material', value };
          break;
        case 'gender':
          endpoint = '/api/admin/product-options';
          body = { type: 'gender', value };
          break;
        case 'brand':
          endpoint = '/api/admin/brands';
          body = { name: value };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }

      const newItem = await response.json();

      switch (type) {
        case 'category':
          setCategories([...categories, newItem]);
          setFormData({ ...formData, categoryId: newItem.id });
          break;
        case 'material':
          setMaterials([...materials, newItem]);
          setFormData({ ...formData, material: newItem.value });
          break;
        case 'gender':
          setGenders([...genders, newItem]);
          setFormData({ ...formData, gender: newItem.value });
          break;
        case 'brand':
          setBrands([...brands, newItem]);
          setFormData({ ...formData, marque: newItem.name });
          break;
      }
    } catch (err) {
      throw err;
    }
  };

  const openModal = (type: 'category' | 'material' | 'gender' | 'brand') => {
    setModalState({ type, isOpen: true });
  };

  const closeModal = () => {
    setModalState({ type: null, isOpen: false });
  };

  const getModalConfig = () => {
    const { type } = modalState;
    const configs = {
      category: {
        title: 'Ajouter une catégorie',
        label: 'Nom de la catégorie',
        placeholder: 'Ex: Lunettes de soleil',
        requiresImage: true,
      },
      material: {
        title: 'Ajouter un matériau',
        label: 'Nom du matériau',
        placeholder: 'Ex: Acétate, Métal, Titane',
        requiresImage: false,
      },
      gender: {
        title: 'Ajouter un genre',
        label: 'Type de genre',
        placeholder: 'Ex: Homme, Femme, Unisexe',
        requiresImage: false,
      },
      brand: {
        title: 'Ajouter une marque',
        label: 'Nom de la marque',
        placeholder: 'Ex: Ray-Ban, Oakley',
        requiresImage: false,
      },
    };
    return type ? configs[type] : configs.category;
  };

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
    if (formData.firstOrderRemisePct.trim()) {
      const remise = Number.parseFloat(formData.firstOrderRemisePct)
      if (Number.isNaN(remise) || remise < 0 || remise > 100) {
        return t.invalidRemise
      }
    }
    if (formData.loyaltyPointsReward.trim()) {
      const points = Number.parseInt(formData.loyaltyPointsReward, 10)
      if (Number.isNaN(points) || points < 0) {
        return "Points de fidélité invalides"
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
        firstOrderRemisePct: formData.firstOrderRemisePct ? Number.parseFloat(formData.firstOrderRemisePct) : null,
        loyaltyPointsReward: formData.loyaltyPointsReward ? Number.parseInt(formData.loyaltyPointsReward, 10) : null,
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
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
        <h1 className="text-3xl font-bold text-white">Modifier le produit</h1>
        <p className="text-gray-300 mt-2">Mettez à jour les informations et la disponibilité du produit</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 mb-6 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center gap-3 text-gray-500 py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Informations principales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="Ex: Lunettes de soleil Aviateur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="SP-001"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  placeholder="Description détaillée du produit..."
                />
              </div>
            </div>

            {/* Categorization */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Catégorisation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openModal('category')}
                      className="px-4 py-3 bg-[#f56a24] text-white rounded-lg hover:bg-[#d45a1f] transition-all shadow-md hover:shadow-lg flex items-center"
                      title="Ajouter une catégorie"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.marque}
                      onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez une marque</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openModal('brand')}
                      className="px-4 py-3 bg-[#f56a24] text-white rounded-lg hover:bg-[#d45a1f] transition-all shadow-md hover:shadow-lg flex items-center"
                      title="Ajouter une marque"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matériau
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez un matériau</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.value}>
                          {material.value}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openModal('material')}
                      className="px-4 py-3 bg-[#f56a24] text-white rounded-lg hover:bg-[#d45a1f] transition-all shadow-md hover:shadow-lg flex items-center"
                      title="Ajouter un matériau"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez un genre</option>
                      {genders.map((gender) => (
                        <option key={gender.id} value={gender.value}>
                          {gender.value}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openModal('gender')}
                      className="px-4 py-3 bg-[#f56a24] text-white rounded-lg hover:bg-[#d45a1f] transition-all shadow-md hover:shadow-lg flex items-center"
                      title="Ajouter un genre"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forme
                  </label>
                  <input
                    type="text"
                    value={formData.shape}
                    onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="Rectangulaire, Ronde, Aviateur..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="Noir, Écaille, Transparent..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Prix et Stock
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (DH) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="99.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix soldé (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="89.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remise 1ère commande (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.firstOrderRemisePct}
                    onChange={(e) => setFormData({ ...formData, firstOrderRemisePct: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points de Fidélité (Opticians Only)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.loyaltyPointsReward}
                  onChange={(e) => setFormData({ ...formData, loyaltyPointsReward: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Points de fidélité gagnés par les opticiens lors de l&apos;achat de ce produit
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Images
              </h2>
              
              <div>
                <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#f56a24] hover:bg-orange-50 transition-all group">
                  <div className="text-center">
                    <Upload className="mx-auto h-16 w-16 text-gray-400 group-hover:text-[#f56a24] transition-colors" />
                    <p className="mt-4 text-base text-gray-600">
                      <span className="font-semibold text-[#f56a24]">Cliquez pour uploader</span> ou glissez-déposez
                    </p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP jusqu&apos;à 10MB</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#f56a24] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
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
                        className="w-full h-40 object-cover rounded-lg border-2 border-[#f56a24]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                Options
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    formData.inStock
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-red-500 bg-red-50 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.inStock
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-500 bg-red-500'
                    }`}>
                      {formData.inStock ? (
                        <Check className="h-7 w-7 text-white" />
                      ) : (
                        <X className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className={`font-bold text-lg block ${formData.inStock ? 'text-green-700' : 'text-red-700'}`}>
                        {formData.inStock ? 'En stock' : 'Rupture de stock'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formData.inStock ? 'Produit disponible à la vente' : 'Produit indisponible'}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNewCollection: !formData.isNewCollection })}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    formData.isNewCollection
                      ? 'border-[#f56a24] bg-orange-50 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.isNewCollection
                        ? 'border-[#f56a24] bg-[#f56a24]'
                        : 'border-gray-300'
                    }`}>
                      {formData.isNewCollection && <Check className="h-6 w-6 text-white" />}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900 block">Nouvelle collection</span>
                      <span className="text-sm text-gray-500">Marquer comme nouveau</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t-2">
              <Button type="submit" disabled={saving} className="flex-1 py-4 text-lg font-semibold shadow-lg">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mise à jour...
                  </span>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
              <Link href="/admin/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full py-4 text-lg font-semibold">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Add Option Modal */}
      <AddOptionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onAdd={handleAddOption}
        {...getModalConfig()}
      />
    </div>
  )
}
