'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

interface ProductRow {
  id: string;
  name: string;
  reference: string;
  price: number;
  salePrice: number | null;
  stockQty: number;
  inStock: boolean;
  categoryName: string | null;
  images: string[];
  isNewCollection: boolean;
}

type RawProduct = {
  id: string;
  name: string;
  reference: string;
  price: number;
  salePrice?: number | null;
  stockQty: number;
  inStock: boolean;
  category?: { name?: string | null } | null;
  images?: string | string[] | null;
  isNewCollection?: boolean | null;
};

const parseImages = (input: RawProduct['images']): string[] => {
  if (Array.isArray(input)) {
    return input.map((img) => String(img));
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        return parsed.map((img) => String(img));
      }
    } catch {
      return input.trim() ? [input.trim()] : [];
    }
  }
  return [];
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    loadProducts();
  }, [session, status, router]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) {
        throw new Error('Failed to load products.');
      }
      const data = await res.json();
      const rawProducts: RawProduct[] = Array.isArray(data.products) ? data.products : [];
      const normalized: ProductRow[] = rawProducts.map((product) => ({
        id: product.id,
        name: product.name,
        reference: product.reference,
        price: product.price,
        salePrice: product.salePrice ?? null,
        stockQty: product.stockQty,
        inStock: product.inStock,
        categoryName: product.category?.name ?? null,
        images: parseImages(product.images),
        isNewCollection: Boolean(product.isNewCollection),
      }));
      setProducts(normalized);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des produits.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNewCollection = async (productId: string, currentValue: boolean) => {
    setUpdatingProductId(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, isNewCollection: !currentValue }),
      });

      if (!res.ok) {
        throw new Error('toggle failed');
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, isNewCollection: !currentValue }
            : product
        )
      );
    } catch (err) {
      console.error(err);
      setError(t.toggleNewCollectionError);
    } finally {
      setUpdatingProductId(null);
    }
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-abyssal">{t.editProducts}</h1>
            <p className="text-sm text-gray-500">{t.editProductSubtitle}</p>
          </div>
          <Link href="/admin/products/new">
            <Button variant="secondary" className="flex items-center">
              <PenSquare className="h-4 w-4 mr-2" />
              {t.createProduct}
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow-lg p-6 rounded-lg">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Référence</th>
                    <th className="px-3 py-2">{t.productName}</th>
                    <th className="px-3 py-2">Catégorie</th>
                    <th className="px-3 py-2">{t.price}</th>
                    <th className="px-3 py-2">Stock</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">{t.newCollection}</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                        Aucun produit disponible.
                      </td>
                    </tr>
                  )}
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="px-3 py-3 text-sm font-medium text-gray-700">{product.reference}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{product.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">
                        {product.categoryName || '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">
                        {product.salePrice ?? product.price} DH
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">{product.stockQty}</td>
                      <td className="px-3 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.inStock ? t.inStock : t.outOfStock}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <Button
                          variant={product.isNewCollection ? 'primary' : 'outline'}
                          size="sm"
                          disabled={updatingProductId === product.id}
                          onClick={() => handleToggleNewCollection(product.id, product.isNewCollection)}
                        >
                          {product.isNewCollection ? t.removeNewCollection : t.markNewCollection}
                        </Button>
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium">
                        <Link href={`/admin/products/${product.id}`} className="inline-flex items-center text-blue-600">
                          <PenSquare className="h-4 w-4 mr-1" />
                          {t.edit}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
