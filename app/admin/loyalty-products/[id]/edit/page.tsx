'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LoyaltyProduct {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  isActive: boolean;
  stockQty: number;
  product?: {
    id: string;
    name: string;
    reference: string;
    stockQty: number;
  } | null;
}

export default function EditLoyaltyProductPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const productId = params.id as string;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    pointsCost: '',
    stockQty: '',
    isActive: true,
  });
  
  const [linkedProduct, setLinkedProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchProduct();
  }, [session, status, router, productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/loyalty-products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          pointsCost: String(data.pointsCost),
          stockQty: String(data.stockQty),
          isActive: data.isActive,
        });
        setImagePreview(data.imageUrl || '');
        if (data.product) {
          setLinkedProduct(data.product);
        }
      } else {
        setError('Produit introuvable');
      }
    } catch (error) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pointsCost) {
      setError('Le nom et le coût en points sont requis');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        imageUrl = base64;
      }

      const res = await fetch(`/api/admin/loyalty-products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          pointsCost: parseInt(formData.pointsCost),
          stockQty: parseInt(formData.stockQty) || 0,
        }),
      });

      if (res.ok) {
        setSuccess('Produit mis à jour avec succès!');
        setTimeout(() => {
          router.push('/admin/loyalty-products');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#f56a24] mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
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
            Modifier le Produit de Fidélité
          </h1>
          <p className="text-gray-600 mt-2">
            Mettez à jour les informations du produit
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Linked Product Info */}
        {linkedProduct && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-[#2C3B4D]">
                Produit Lié
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Nom:</span> {linkedProduct.name}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Référence:</span> {linkedProduct.reference}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Stock actuel:</span> {linkedProduct.stockQty} unités
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Ce produit de fidélité est lié à un produit existant. Le stock sera synchronisé automatiquement.
            </p>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="h-6 w-6" />
              Informations du Produit
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Disponible {linkedProduct && <span className="text-xs text-gray-500">(synchronisé si lié)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQty}
                  onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent transition-all"
                  placeholder="10"
                  disabled={!!linkedProduct}
                />
                {linkedProduct && (
                  <p className="text-xs text-gray-500 mt-1">
                    Le stock est géré par le produit lié
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image du Produit
              </label>
              
              {imagePreview ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
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
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ou URL de l&apos;image
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    }
                  }}
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
                disabled={submitting}
                className="flex-1 bg-[#f56a24] hover:bg-[#e55a14] text-white py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mise à jour...
                  </span>
                ) : (
                  'Mettre à jour le Produit'
                )}
              </Button>
              <Link href="/admin/loyalty-products">
                <Button
                  type="button"
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
