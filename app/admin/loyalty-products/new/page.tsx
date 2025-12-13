'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Package, Wand2, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  reference: string;
  description: string | null;
  price: number;
  images: string[] | string;
}

type CreationMode = 'select' | 'manual' | null;

export default function NewLoyaltyProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<CreationMode>(null);
  
  // For selecting existing product
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pointsCost, setPointsCost] = useState('');
  
  // For manual creation
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    pointsCost: '',
    isActive: true,
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (mode === 'select') {
      fetchProducts();
    }
  }, [mode]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        const productsWithParsedImages = (data.products || []).map((p: Product) => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images as string) : (Array.isArray(p.images) ? p.images : []),
        }));
        setProducts(productsWithParsedImages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pointsCost) {
      setError('Le nom et le coût en points sont requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFiles.length > 0) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFiles[0]);
        });
        imageUrl = base64;
      }

      const res = await fetch('/api/admin/loyalty-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          pointsCost: parseInt(formData.pointsCost),
        }),
      });

      if (res.ok) {
        router.push('/admin/loyalty-products');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertProduct = async () => {
    if (!selectedProduct || !pointsCost) {
      setError('Veuillez sélectionner un produit et définir le coût en points');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extract first image safely from parsed array
      const imageUrl = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 
        ? selectedProduct.images[0] 
        : null;

      const res = await fetch('/api/admin/loyalty-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id, // Link to the original product
          name: selectedProduct.name,
          description: selectedProduct.description,
          imageUrl: imageUrl,
          pointsCost: parseInt(pointsCost),
          isActive: true,
        }),
      });

      if (res.ok) {
        router.push('/admin/loyalty-products');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la conversion');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/loyalty-products"
            className="inline-flex items-center gap-2 text-[#2C3B4D] hover:text-[#f56a24] transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au Catalogue
          </Link>
          
          <h1 className="text-4xl font-bold text-[#2C3B4D]">
            Nouveau Produit de Fidélité
          </h1>
          <p className="text-gray-600 mt-2">
            Choisissez comment créer votre produit de fidélité
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Mode Selection */}
        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode('manual')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#f56a24] group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#f56a24] to-[#ff8345] mb-6 group-hover:scale-110 transition-transform">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C3B4D] mb-3">
                  Création Manuelle
                </h2>
                <p className="text-gray-600">
                  Créez un nouveau produit de fidélité avec tous les détails personnalisés
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode('select')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#f56a24] group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C3B4D] mb-3">
                  Depuis un Produit Existant
                </h2>
                <p className="text-gray-600">
                  Convertissez un produit existant en produit de fidélité
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Manual Creation Form */}
        {mode === 'manual' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Wand2 className="h-6 w-6" />
                Création Manuelle
              </h2>
            </div>

            <form onSubmit={handleManualSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  placeholder="Ex: Écrin Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Décrivez le produit..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Coût en Points *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image du Produit
                </label>
                
                <div className="mb-4">
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou URL de l&apos;image
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#f56a24] rounded focus:ring-2 focus:ring-[#f56a24]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Produit actif (visible pour les opticiens)
                </label>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#f56a24] hover:bg-[#e55a14] text-white py-3 text-lg font-semibold"
                >
                  {loading ? 'Création...' : 'Créer le Produit'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setMode(null)}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Select Existing Product */}
        {mode === 'select' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Package className="h-6 w-6" />
                Convertir un Produit Existant
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  placeholder="Rechercher un produit par nom ou référence..."
                />
              </div>

              {selectedProduct ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-4">
                      {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && selectedProduct.images[0] && (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2C3B4D]">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Réf: {selectedProduct.reference}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coût en Points de Fidélité *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={pointsCost}
                      onChange={(e) => setPointsCost(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Définissez combien de points ce produit coûtera aux opticiens
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t">
                    <Button
                      onClick={handleConvertProduct}
                      disabled={loading}
                      className="flex-1 bg-[#f56a24] hover:bg-[#e55a14] text-white py-3 text-lg font-semibold"
                    >
                      {loading ? 'Conversion...' : 'Convertir en Produit de Fidélité'}
                    </Button>
                    <Button
                      onClick={() => setMode(null)}
                      className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#f56a24] hover:bg-orange-50 transition-all text-left"
                      >
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2C3B4D]">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#f56a24]">
                            {product.price} DH
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
