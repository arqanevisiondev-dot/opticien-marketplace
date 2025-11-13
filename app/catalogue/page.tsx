'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
  slug?: string;
  reference: string;
  material: string;
  gender: string;
  color: string;
  price: number;
  images: string[];
  inStock: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CataloguePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    material: '',
    gender: '',
    color: '',
  });

  // Vérifier si l'utilisateur peut voir les prix
  const canSeePrices = 
    (session?.user?.role === 'OPTICIAN' && session?.user?.opticianStatus === 'APPROVED') || 
    session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  // Get unique values from products
  const uniqueMaterials = Array.from(new Set(products.map(p => p.material).filter(Boolean)));
  const uniqueGenders = Array.from(new Set(products.map(p => p.gender).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || product.category?.id === filters.category;
    const matchesMaterial = !filters.material || product.material === filters.material;
    const matchesGender = !filters.gender || product.gender === filters.gender;
    const matchesColor = !filters.color || product.color === filters.color;

    return matchesSearch && matchesCategory && matchesMaterial && matchesGender && matchesColor;
  });

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-abyssal mb-2">{t.catalog}</h1>
        <p className="text-gray-600">{t.exclusiveCatalogDesc}</p>
        <div className="bg-white p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search + '...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
                />
              </div>
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            >
              <option value="">{t.categories || 'Toutes les catégories'}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            >
              <option value="">Tous les matériaux</option>
              {uniqueMaterials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            >
              <option value="">Tous les genres</option>
              {uniqueGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
            <p className="mt-4 text-gray-600">{t.loading}...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-lg">
            <p className="text-gray-600 text-lg">{t.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                <div className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pas d&apos;image
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                        RUPTURE
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-abyssal mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t.reference}: {product.reference}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {product.material} • {product.gender}
                      </div>
                      <div className="text-sm font-semibold">
                        {canSeePrices ? (
                          <span className="text-burning-flame">{product.price.toFixed(2)} €</span>
                        ) : (
                          <span className="text-gray-400">{t.priceOnRequest}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-fantastic text-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{t.professionalPrices}</h2>
          <p className="mb-6">
            {t.ctaSubtitle}
          </p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg">
              {t.createFreeAccount}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
