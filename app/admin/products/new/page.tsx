'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  value: string;
}

export default function NewProductPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<ProductOption[]>([]);
  const [genders, setGenders] = useState<ProductOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    categoryId: '',
    material: '',
    gender: '',
    shape: '',
    color: '',
    price: '',
    images: '',
    inStock: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');

  // Protection admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch categories, materials, and genders
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
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchOptions();
    }
  }, [session]);

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      const newColors = [...colors, colorInput.trim()];
      setColors(newColors);
      setFormData({ ...formData, color: newColors.join(', ') });
      setColorInput('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const newColors = colors.filter(c => c !== colorToRemove);
    setColors(newColors);
    setFormData({ ...formData, color: newColors.join(', ') });
  };

  const handleColorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Add new files to existing ones
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imagesArray: string[] = [];

      // If files were uploaded, convert to base64
      if (imageFiles.length > 0) {
        const base64Images = await Promise.all(
          imageFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
        imagesArray = base64Images;
      } else if (formData.images) {
        // Otherwise use URLs from textarea
        imagesArray = formData.images
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        images: JSON.stringify(imagesArray),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.creating);
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loading);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="bg-white shadow-lg p-8">
          <h1 className="text-3xl font-bold text-abyssal mb-6">{t.newProductTitle}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  required
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
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="SP-001"
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
                <option value="">{t.categories || 'Sélectionnez une catégorie'}</option>
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
                  <option value="">Sélectionnez un matériau</option>
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
                  <option value="">Sélectionnez un genre</option>
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
                  {t.productColor} (plusieurs couleurs)
                </label>
                
                {/* Color Tags */}
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {colors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Color Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyPress={handleColorKeyPress}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                    placeholder="Noir, Écaille, Transparent..."
                  />
                  <Button
                    type="button"
                    onClick={handleAddColor}
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Appuyez sur Entrée ou cliquez sur Ajouter pour ajouter une couleur
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.price} (€) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                placeholder="99.99"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images du produit
              </label>
              
              {/* File Upload Button */}
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

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Alternative: URL Input */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Ou entrez des URLs d&apos;images:</p>
                <textarea
                  rows={3}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  disabled={imageFiles.length > 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {imageFiles.length > 0 ? 'Désactivé car des fichiers sont uploadés' : 'Une URL par ligne'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="h-4 w-4 text-blue-fantastic focus:ring-blue-fantastic border-gray-300"
              />
              <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                {t.inStock}
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t.creating : t.createProduct}
              </Button>
              <Link href="/admin" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t.cancel}
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
