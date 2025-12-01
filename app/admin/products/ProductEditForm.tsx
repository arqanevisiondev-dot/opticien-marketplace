'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductEditFormProps {
  productId: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductOptionItem {
  id: string;
  value: string;
}

const emptyForm = {
  name: '',
  reference: '',
  description: '',
  categoryId: '',
  material: '',
  gender: '',
  shape: '',
  color: '',
  price: '',
  salePrice: '',
  stockQty: '',
  firstOrderRemisePct: '',
  images: '',
  inStock: true,
  isNewCollection: false,
};

export default function ProductEditForm({ productId }: ProductEditFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [materials, setMaterials] = useState<ProductOptionItem[]>([]);
  const [genders, setGenders] = useState<ProductOptionItem[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, materialsRes, gendersRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/admin/product-options?type=material'),
          fetch('/api/admin/product-options?type=gender'),
        ]);
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data);
        }
        if (materialsRes.ok) {
          const data = await materialsRes.json();
          setMaterials(data);
        }
        if (gendersRes.ok) {
          const data = await gendersRes.json();
          setGenders(data);
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchOptions();
    }
  }, [session]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoadingData(true);
      try {
        const res = await fetch(`/api/admin/products?id=${productId}`);
        if (!res.ok) {
          throw new Error('failed');
        }
        const data = await res.json();
        const product = data.product;
        setFormData({
          name: product.name ?? '',
          reference: product.reference ?? '',
          description: product.description ?? '',
          categoryId: product.categoryId ?? '',
          material: product.material ?? '',
          gender: product.gender ?? '',
          shape: product.shape ?? '',
          color: product.color ?? '',
          price: String(product.price ?? ''),
          salePrice: product.salePrice != null ? String(product.salePrice) : '',
          stockQty: product.stockQty != null ? String(product.stockQty) : '',
          firstOrderRemisePct:
            product.firstOrderRemisePct != null ? String(product.firstOrderRemisePct) : '',
          images: '',
          inStock: product.inStock ?? true,
          isNewCollection: product.isNewCollection ?? false,
        });
        setExistingImages(Array.isArray(product.images) ? product.images : []);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du produit.');
      } finally {
        setLoadingData(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchProduct();
    }
  }, [productId, session]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImagePreview = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Le nom est requis.';
    }
    if (!formData.reference.trim()) {
      return 'La référence est requise.';
    }
    const price = parseFloat(formData.price);
    if (Number.isNaN(price) || price <= 0) {
      return 'Le prix doit être un nombre positif.';
    }
    if (formData.salePrice.trim()) {
      const sale = parseFloat(formData.salePrice);
      if (Number.isNaN(sale) || sale <= 0) {
        return 'Le prix soldé doit être un nombre positif.';
      }
    }
    if (formData.stockQty.trim()) {
      const stock = parseInt(formData.stockQty, 10);
      if (Number.isNaN(stock) || stock < 0) {
        return 'Le stock doit être un entier positif ou nul.';
      }
    }
    if (formData.firstOrderRemisePct.trim()) {
      const remise = parseFloat(formData.firstOrderRemisePct);
      if (Number.isNaN(remise) || remise < 0 || remise > 100) {
        return 'La remise doit être comprise entre 0 et 100%.';
      }
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);

    try {
      let newImages: string[] = [];
      if (imageFiles.length > 0) {
        newImages = await Promise.all(
          imageFiles.map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          )
        );
      }

      const manualImages = formData.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const payload = {
        id: productId,
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stockQty: formData.stockQty ? parseInt(formData.stockQty, 10) : 0,
        firstOrderRemisePct: formData.firstOrderRemisePct
          ? parseFloat(formData.firstOrderRemisePct)
          : null,
        images: [...existingImages, ...manualImages, ...newImages],
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour.');
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-abyssal">{t.editProductTitle}</h1>
            <p className="text-sm text-gray-500">{t.editProductSubtitle}</p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {loadingData ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productReference} *
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productDescription}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category}
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                >
                  <option value="">{t.selectGender}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productMaterial}
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  >
                    <option value="">{t.selectMaterialPlaceholder}</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.value}>
                        {material.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productGender}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  >
                    <option value="">{t.selectGenderPlaceholder}</option>
                    {genders.map((gender) => (
                      <option key={gender.id} value={gender.value}>
                        {gender.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productShape}
                  </label>
                  <input
                    type="text"
                    value={formData.shape}
                    onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="Rectangulaire, Ronde, Aviateur..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.productColor}
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="Noir, Écaille, Transparent..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.oneColorPerProduct}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.price} (DH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="99.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.salePriceDH}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="89.99"
                />
                <p className="text-xs text-gray-500 mt-1">{t.leaveEmptyIfNoPromo}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.availableStock}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.stockDisplayNote}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.firstOrderDiscount}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.firstOrderRemisePct}
                    onChange={(e) => setFormData({ ...formData, firstOrderRemisePct: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.firstOrderDiscountNote}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images du produit
                </label>
                <div className="mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-fantastic hover:bg-blue-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-fantastic">Cliquez pour uploader</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP jusqu&apos;à 10MB (plusieurs images)</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img src={url} alt={`Existing ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
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
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
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

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Ou entrez des URLs d&apos;images:</p>
                  <textarea
                    rows={3}
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                    disabled={imageFiles.length > 0}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {imageFiles.length > 0 ? 'Désactivé car des fichiers sont uploadés' : 'Une URL par ligne'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="h-4 w-4 text-blue-fantastic focus:ring-blue-fantastic border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t.inStock}</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="isNewCollection"
                    checked={formData.isNewCollection}
                    onChange={(e) => setFormData({ ...formData, isNewCollection: e.target.checked })}
                    className="h-4 w-4 text-burning-flame focus:ring-burning-flame border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t.newCollection}</span>
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? t.creating : t.editProductTitle}
                </Button>
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    {t.cancel}
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
