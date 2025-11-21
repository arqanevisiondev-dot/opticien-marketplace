'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  slug?: string;
  reference: string;
  material: string;
  gender: string;
  color: string;
  price: number;
  salePrice?: number;
  images: string[];
  inStock: boolean;
  isNewCollection?: boolean;
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

type ApiProduct = Omit<Product, 'images'> & {
  images?: unknown;
  isNewCollection?: boolean | null;
};

export default function CataloguePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { add, isInCart } = useCart();
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
  const isOptician = session?.user?.role === 'OPTICIAN';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        console.error('Failed to fetch products, status:', res.status);
        setProducts([]);
        return;
      }
      const data = await res.json();
      const rawProducts: ApiProduct[] = Array.isArray(data) ? (data as ApiProduct[]) : [];
      const normalized: Product[] = rawProducts.map((product) => ({
        ...product,
        images: Array.isArray(product.images) ? product.images.map((img) => String(img)) : [],
        isNewCollection: Boolean(product.isNewCollection),
      }));
      setProducts(normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Get unique values from products
  const safeProducts = Array.isArray(products) ? products : [];
  const uniqueMaterials = Array.from(new Set(safeProducts.map(p => p.material).filter(Boolean)));
  const uniqueGenders = Array.from(new Set(safeProducts.map(p => p.gender).filter(Boolean)));
  const newCollectionProducts = safeProducts.filter((product) => product.isNewCollection);
  const featuredNewCollection = newCollectionProducts[0];
  const additionalNewCollection = newCollectionProducts.slice(1);

  const filteredProducts = safeProducts.filter((product) => {
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

        {featuredNewCollection && (
          <section className="mt-8 mb-10">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <Link
                  href={`/catalogue/${featuredNewCollection.slug || featuredNewCollection.id}`}
                  className="relative lg:w-1/2 h-72 lg:h-auto"
                >
                  {featuredNewCollection.images?.[0] ? (
                    <img
                      src={featuredNewCollection.images[0]}
                      alt={featuredNewCollection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      Pas d&apos;image
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-burning-flame text-white px-4 py-1 text-xs font-semibold uppercase tracking-wide shadow-md rounded-sm">
                    {t.newBadge}
                  </div>
                </Link>
                <div className="flex-1 p-6 lg:p-8 space-y-4">
                  <span className="inline-flex items-center rounded-full bg-burning-flame/10 text-burning-flame px-3 py-1 text-sm font-semibold">
                    {t.newCollection}
                  </span>
                  <h2 className="text-3xl font-bold text-abyssal">{featuredNewCollection.name}</h2>
                  <p className="text-gray-600">
                    {t.reference}: {featuredNewCollection.reference}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{featuredNewCollection.material}</span>
                    <span>•</span>
                    <span>{featuredNewCollection.gender}</span>
                    {featuredNewCollection.color && (
                      <>
                        <span>•</span>
                        <span>{featuredNewCollection.color}</span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/catalogue/${featuredNewCollection.slug || featuredNewCollection.id}`}
                    className="inline-block"
                  >
                    <Button variant="secondary">{t.view}</Button>
                  </Link>
                </div>
              </div>
            </div>

            {additionalNewCollection.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {additionalNewCollection.map((product) => (
                  <Link key={product.id} href={`/catalogue/${product.slug || product.id}`}>
                    <div className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-200">
                        {product.images?.[0] ? (
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
                        <div className="absolute top-3 right-3 bg-burning-flame text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-md rounded-sm">
                          {t.newBadge}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-abyssal mb-1">{product.name}</h3>
                        <p className="text-xs text-gray-500">{t.reference}: {product.reference}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

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
                    {product.isNewCollection && (
                      <div className="absolute top-3 right-3 bg-burning-flame text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-md rounded-sm">
                        {t.newBadge}
                      </div>
                    )}
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
                          product.salePrice ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-gray-500 line-through">
                                {product.price.toFixed(2)} DH
                              </span>
                              <span className="text-gray-500">/</span>
                              <span className="text-burning-flame text-xl font-bold">
                                {product.salePrice.toFixed(2)} DH
                              </span>
                            </div>
                          ) : (
                            <span className="text-burning-flame">{product.price.toFixed(2)} DH</span>
                          )
                        ) : (
                          <span className="text-gray-400">{t.priceOnRequest}</span>
                        )}
                      </div>
                    </div>
                    {isOptician && (
                      <div className="mt-3">
                        <Button
                          variant={isInCart(product.id) ? 'outline' : 'primary'}
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isInCart(product.id)) {
                              const url = `/catalogue/${product.slug || product.id}`;
                              add({ id: product.id, name: product.name, reference: product.reference, url });
                            }
                          }}
                        >
                          {isInCart(product.id) ? 'Dans le panier' : 'Ajouter'}
                        </Button>
                      </div>
                    )}
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
