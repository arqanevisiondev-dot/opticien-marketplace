'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Package, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoyaltyProduct {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LoyaltyProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<LoyaltyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; product: LoyaltyProduct | null }>({ show: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/loyalty-products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/loyalty-products/${deleteModal.product.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccessMessage('Produit supprimé avec succès!');
        setDeleteModal({ show: false, product: null });
        fetchProducts();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[#2C3B4D] hover:text-[#f56a24] transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2C3B4D] flex items-center gap-3">
                <Package className="h-10 w-10 text-[#f56a24]" />
                Catalogue de Fidélité
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les produits que les opticiens peuvent échanger avec leurs points
              </p>
            </div>
            
            <Link href="/admin/loyalty-products/new">
              <Button className="bg-[#f56a24] hover:bg-[#e55a14] text-white">
                <Plus className="h-5 w-5 mr-2" />
                Nouveau Produit
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-3xl font-bold text-[#2C3B4D] mt-1">{products.length}</p>
              </div>
              <Package className="h-12 w-12 text-[#f56a24] opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produits Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Coût (Points)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg mb-4">Aucun produit de fidélité</p>
                      <Link href="/admin/loyalty-products/new">
                        <Button className="bg-[#f56a24] hover:bg-[#e55a14] text-white">
                          <Plus className="h-5 w-5 mr-2" />
                          Créer le premier produit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-[#2C3B4D]">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                          {product.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-[#f56a24]">
                          {product.pointsCost}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                        {product.productId && (
                          <div className="text-xs text-gray-500 mt-1">
                            (Produit lié)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/loyalty-products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, product })}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && deleteModal.product && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-t-lg">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-6 w-6" />
                  Confirmer la suppression
                </h3>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Êtes-vous sûr de vouloir supprimer ce produit de fidélité?
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      {deleteModal.product.imageUrl && (
                        <img
                          src={deleteModal.product.imageUrl}
                          alt={deleteModal.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-[#2C3B4D]">
                          {deleteModal.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {deleteModal.product.pointsCost} points
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-red-600 font-medium mb-6">
                  ⚠️ Cette action est irréversible
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, product: null })}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
