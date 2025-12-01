'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Search, Package, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  reference: string;
  marque: string;
  material: string;
  gender: string;
  color: string;
  price: number;
  salePrice?: number;
  stockQty: number;
  inStock: boolean;
  isNewCollection: boolean;
  images: string[];
  category?: Category;
  createdAt: string;
}

export default function ProductsListPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [session, status, router]);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.color.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((product) => product.category?.id === filterCategory);
    }

    // Stock filter
    if (filterStock === 'in-stock') {
      filtered = filtered.filter((product) => product.inStock);
    } else if (filterStock === 'out-of-stock') {
      filtered = filtered.filter((product) => !product.inStock);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, filterCategory, filterStock, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        // The API returns { products } so we need to extract the array
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        const normalized = productsArray.map((p: any) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
        }));
        setProducts(normalized);
        setFilteredProducts(normalized);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setDeleteConfirm(null);
      } else {
        alert('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const getFirstImage = (images: string[]) => {
    if (images.length > 0) {
      return images[0];
    }
    return '/placeholder-product.png';
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="mb-4 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToDashboard}
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2C3B4D] mb-2">{t.productsManagementTitle}</h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length !== 1 ? t.productsCountPlural : t.productsCount}
              </p>
            </div>
            <Link href="/admin/products/new">
              <Button className="bg-[#f56a24] hover:bg-[#d45a1e] text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                {t.newProduct}
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchByNameRefBrand}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent appearance-none"
              >
                <option value="">{t.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f56a24] focus:border-transparent appearance-none"
              >
                <option value="all">{t.allStock}</option>
                <option value="in-stock">{t.inStock}</option>
                <option value="out-of-stock">{t.outOfStock}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noProductsFound}</h3>
            <p className="text-gray-500 mb-6">{t.startByCreatingProduct}</p>
            <Link href="/admin/products/new">
              <Button className="bg-[#f56a24] hover:bg-[#d45a1e] text-white">
                <Plus className="h-5 w-5 mr-2" />
                {t.createProduct}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={getFirstImage(product.images)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isNewCollection && (
                    <div className="absolute top-2 right-2 bg-[#f56a24] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {t.newBadge}
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {t.outOfStockBadge}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#2C3B4D] flex-1">{product.name}</h3>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t.ref}</span> {product.reference}
                    </p>
                    {product.marque && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t.brand}</span> {product.marque}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t.category}:</span>{' '}
                      {product.category?.name || t.notCategorized}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t.material}:</span> {product.material || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t.gender}:</span> {product.gender || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t.color}:</span> {product.color}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.salePrice ? (
                        <div>
                          <span className="text-lg font-bold text-[#f56a24]">
                            {product.salePrice.toFixed(2)} DH
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {product.price.toFixed(2)} DH
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#2C3B4D]">
                          {product.price.toFixed(2)} DH
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t.stock} <span className="font-semibold">{product.stockQty}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/catalogue/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {t.view}
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t.modify}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(product.id)}
                      className="text-red-600 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[#2C3B4D] mb-4">{t.confirmDeletion}</h3>
              <p className="text-gray-600 mb-6">
                {t.confirmDeleteProduct}
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  {t.cancel}
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  {t.deleteAction}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
