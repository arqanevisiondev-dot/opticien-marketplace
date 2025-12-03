'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gift, Star, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoyaltyProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  inStock: boolean;
  isActive: boolean;
}

export default function LoyaltyCatalogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState<LoyaltyProduct[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { add, loyaltyItems } = useCart();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'OPTICIAN') {
      router.push('/auth/signin');
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [productsRes, pointsRes] = await Promise.all([
        fetch('/api/loyalty-products'),
        fetch('/api/me/loyalty-points'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }

      if (pointsRes.ok) {
        const data = await pointsRes.json();
        setLoyaltyPoints(data.loyaltyPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: LoyaltyProduct) => {
    add({
      id: product.id,
      name: product.name,
      reference: product.id,
      url: product.imageUrl || '',
      type: 'loyalty',
      pointsCost: product.pointsCost,
      imageUrl: product.imageUrl,
      description: product.description,
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f56a24]"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[#2C3B4D] hover:text-[#f56a24] mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.backToProfile}
          </Link>
          
          <h1 className="text-4xl font-bold text-[#2C3B4D] flex items-center gap-3">
            <Gift className="h-10 w-10 text-[#f56a24]" />
            {t.loyaltyCatalog}
          </h1>
          <p className="text-gray-600 mt-2">
            {t.loyaltyCatalogSubtitle}
          </p>
        </div>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-[#f56a24] to-[#ff8345] rounded-lg shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t.yourBalance}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">{loyaltyPoints}</span>
                <span className="text-lg opacity-90">{t.points}</span>
              </div>
            </div>
            <Star className="h-16 w-16 opacity-20" />
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {t.noLoyaltyProducts}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const canAfford = loyaltyPoints >= product.pointsCost;
              const isOutOfStock = !product.inStock;
              const inCart = loyaltyItems.find(item => item.id === product.id);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    !canAfford || isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  {product.imageUrl ? (
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{t.outOfStock}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Gift className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2C3B4D] mb-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#f56a24]">
                          {product.pointsCost}
                        </span>
                        <span className="text-sm text-gray-600">{t.points}</span>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        product.inStock 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? t.inStock : t.outOfStockBadge}
                      </span>
                    </div>

                    <button
                      disabled={!canAfford || isOutOfStock}
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        canAfford && !isOutOfStock
                          ? 'bg-[#f56a24] text-white hover:bg-[#e55a14]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isOutOfStock ? (
                        t.outOfStock
                      ) : !canAfford ? (
                        `${t.needMorePoints} ${product.pointsCost - loyaltyPoints} ${t.points}`
                      ) : inCart ? (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          {t.addMore} ({inCart.quantity} {t.inCart})
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          {t.addToCart}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
