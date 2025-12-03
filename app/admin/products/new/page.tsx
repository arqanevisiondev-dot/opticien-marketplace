'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Plus, Check } from 'lucide-react';
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

interface Brand {
  id: string;
  name: string;
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
          // Convert to base64
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
              
              {/* Upload Type Toggle */}
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

export default function NewProductPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<ProductOption[]>([]);
  const [genders, setGenders] = useState<ProductOption[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [modalState, setModalState] = useState<{
    type: 'category' | 'material' | 'gender' | 'brand' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    categoryId: '',
    material: '',
    gender: '',
    marque: '',
    shape: '',
    color: '',
    price: '',
    salePrice: '',
    firstOrderRemisePct: '',
    loyaltyPointsReward: '',
    images: '',
    inStock: true,
    isNewCollection: false,
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Protection admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch all options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, materialsRes, gendersRes, brandsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/admin/product-options?type=material'),
          fetch('/api/admin/product-options?type=gender'),
          fetch('/api/admin/brands'),
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
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setBrands(data);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchOptions();
    }
  }, [session]);

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

      // Update the appropriate list
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.reference || !formData.price) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Handle images
      let imageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        // Convert images to base64
        const base64Images = await Promise.all(
          imageFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
        imageUrls = base64Images;
      } else if (formData.images) {
        imageUrls = formData.images.split('\n').filter(url => url.trim());
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création du produit');
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEE9DF] to-white">
        <div className="text-lg text-gray-600">{t.loading}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/products">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToProducts}
          </Button>
        </Link>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{t.newProduct}</h1>
            <p className="text-gray-300 mt-2">{t.addNewProduct}</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 mb-6 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 border-b-2 border-[#f56a24] pb-2">
                  <span className="bg-[#f56a24] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Informations de base
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-[#f56a24] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OU</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URLs d&apos;images
                  </label>
                  <textarea
                    rows={3}
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    disabled={imageFiles.length > 0}
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Désactivé car des fichiers sont uploadés
                    </p>
                  )}
                </div>
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
                        : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                        formData.inStock
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.inStock && <Check className="h-6 w-6 text-white" />}
                      </div>
                      <div className="text-left">
                        <span className="font-semibold text-gray-900 block">En stock</span>
                        <span className="text-sm text-gray-500">Produit disponible</span>
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
                <Button type="submit" disabled={loading} className="flex-1 py-4 text-lg font-semibold shadow-lg">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    'Créer le produit'
                  )}
                </Button>
                <Link href="/admin/products" className="flex-1">
                  <Button type="button" variant="outline" className="w-full py-4 text-lg font-semibold">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add Option Modal */}
      <AddOptionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onAdd={handleAddOption}
        {...getModalConfig()}
      />
    </div>
  );
}
