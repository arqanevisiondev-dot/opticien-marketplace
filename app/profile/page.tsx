'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  ShoppingCart, 
  Package, 
  Trash2, 
  Plus, 
  Minus,
  CheckCircle,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  reference: string;
  price: number;
  salePrice?: number;
  firstOrderRemisePct?: number;
  images: string[];
  stockQty: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, regularItems, loyaltyItems, increase, decrease, remove, clear, clearLoyalty, getTotalPoints } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingLoyalty, setSubmittingLoyalty] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'OPTICIAN') {
      router.push('/auth/signin');
      return;
    }
    fetchOrderHistory();
    fetchLoyaltyPoints();
  }, [session, status, router]);

  useEffect(() => {
    // Fetch products when regularItems change
    fetchCartProducts();
  }, [regularItems.length]);

  const fetchCartProducts = async () => {
    try {
      if (regularItems.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = regularItems.map(item => item.id);
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: productIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    }
  };

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await fetch('/api/me/loyalty-points');
      if (response.ok) {
        const data = await response.json();
        setLoyaltyPoints(data.loyaltyPoints || 0);
      }
    } catch (err) {
      console.error('Error fetching loyalty points:', err);
    }
  };

  const getProduct = (itemId: string) => {
    return products.find(p => p.id === itemId);
  };

  const calculateItemTotal = (itemId: string, quantity: number) => {
    const product = getProduct(itemId);
    if (!product) return 0;
    
    const price = product.salePrice || product.price;
    let total = price * quantity;
    
    // Apply first order discount if applicable
    if (product.firstOrderRemisePct && product.firstOrderRemisePct > 0) {
      const hasOrderedBefore = orderHistory.some(order => 
        order.items.some((item: any) => item.productId === itemId)
      );
      
      if (!hasOrderedBefore) {
        total = total * (1 - product.firstOrderRemisePct / 100);
      }
    }
    
    return total;
  };

  const calculateTotal = () => {
    return regularItems.reduce((sum, item) => {
      return sum + calculateItemTotal(item.id, item.quantity);
    }, 0);
  };

  const handleConfirmLoyaltyOrder = async () => {
    if (loyaltyItems.length === 0) return;

    const totalPoints = getTotalPoints();
    if (loyaltyPoints < totalPoints) {
      setError(`Points insuffisants. Il vous manque ${totalPoints - loyaltyPoints} points.`);
      return;
    }

    setSubmittingLoyalty(true);
    setError('');
    setSuccess('');

    try {
      const redemptionItems = loyaltyItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        pointsCost: item.pointsCost || 0,
      }));

      const response = await fetch('/api/loyalty-products/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: redemptionItems,
          totalPoints,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec de la commande de fidélité');
      }

      const data = await response.json();
      
      setSuccess('Votre commande de fidélité a été envoyée! L\'admin va la confirmer.');
      clearLoyalty();
      fetchLoyaltyPoints();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmittingLoyalty(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (regularItems.length === 0) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const orderItems = regularItems.map(item => {
        const product = getProduct(item.id);
        if (!product) throw new Error(`Product ${item.name} not found`);

        return {
          productId: item.id,
          productName: product.name,
          productReference: product.reference,
          quantity: item.quantity,
          unitPrice: product.price,
          salePrice: product.salePrice,
          remisePct: product.firstOrderRemisePct,
          totalLine: calculateItemTotal(item.id, item.quantity),
        };
      });

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: calculateTotal(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await response.json();
      
      setSuccess('Votre commande a été envoyée avec succès! L\'admin va confirmer chaque produit.');
      clear();
      setProducts([]);
      
      // Show WhatsApp redirect option
      if (data.whatsappUrl) {
        setTimeout(() => {
          if (window.confirm('Voulez-vous ouvrir WhatsApp pour contacter l\'admin?')) {
            window.open(data.whatsappUrl, '_blank');
          }
        }, 1000);
      }
      
      fetchOrderHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#EEE9DF] via-white to-[#FFF5E8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Enhanced Design */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-r from-[#f56a24] to-[#ff8345] rounded-xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-[#2C3B4D] tracking-tight">
                Mon Profil
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Gérez votre panier et suivez vos commandes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-[#f56a24]">
              <h2 className="text-xl font-bold text-[#2C3B4D] mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#f56a24]" />
                Informations
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-semibold text-[#2C3B4D]">{session?.user?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Statut</p>
                  <p className="font-medium">
                    {session?.user?.opticianStatus === 'APPROVED' && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Approuvé
                      </span>
                    )}
                    {session?.user?.opticianStatus === 'PENDING' && (
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        En attente
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Loyalty Points Card */}
            <div className="bg-gradient-to-br from-[#f56a24] via-[#ff7539] to-[#ff8345] rounded-xl shadow-xl p-6 text-white mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <Package className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Points de Fidélité
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-extrabold drop-shadow-lg">{loyaltyPoints}</span>
                  <span className="text-sm opacity-90 font-medium">points</span>
                </div>
                <p className="text-sm opacity-95 mb-4 leading-relaxed">
                  Gagnez des points à chaque achat et échangez-les contre des produits exclusifs!
                </p>
                <Link href="/loyalty-catalog" className="inline-flex items-center gap-2 bg-white text-[#f56a24] px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  <Package className="h-4 w-4" />
                  Voir le Catalogue
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-blue-500">
                <h3 className="text-lg font-bold text-[#2C3B4D] mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  Résumé de la commande
                </h3>
                <div className="space-y-3">
                  {regularItems.length > 0 && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600 text-sm">Produits réguliers</span>
                        <span className="font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">{regularItems.length}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span className="text-gray-700">Total</span>
                        <span className="text-[#f56a24]">{calculateTotal().toFixed(2)} DH</span>
                      </div>
                    </>
                  )}
                  {loyaltyItems.length > 0 && (
                    <>
                      {regularItems.length > 0 && <div className="border-t-2 pt-3 mt-3" />}
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span className="text-[#f56a24] text-sm font-medium">Produits de fidélité</span>
                        <span className="font-bold bg-orange-100 text-[#f56a24] px-3 py-1 rounded-full text-sm">{loyaltyItems.length}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-orange-200">
                        <span className="text-[#f56a24]">Total Points</span>
                        <span className="text-[#f56a24] text-xl">{getTotalPoints()} pts</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-[#2C3B4D]">
              <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-6 py-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  Mon Panier ({items.length})
                </h2>
              </div>

              <div className="p-6">

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{success}</p>
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg mb-4">Votre panier est vide</p>
                  <Link href="/catalogue">
                    <Button className="bg-[#f56a24] hover:bg-[#d45a1e]">
                      Parcourir le catalogue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Regular Products Section */}
                  {regularItems.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Produits Réguliers ({regularItems.length})
                      </h3>
                      <div className="space-y-4">
                        {regularItems.map((item) => {
                          const product = getProduct(item.id);
                          if (!product) return null;

                          const itemTotal = calculateItemTotal(item.id, item.quantity);
                          const hasDiscount = product.firstOrderRemisePct && product.firstOrderRemisePct > 0;

                          return (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#f56a24]/50 transition-all"
                            >
                              <img
                                src={product.images[0] || '/placeholder.png'}
                                alt={product.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h3 className="font-bold text-[#2C3B4D]">{product.name}</h3>
                                <p className="text-sm text-gray-500">Réf: {product.reference}</p>
                                <div className="mt-2">
                                  <span className="text-lg font-bold text-[#f56a24]">
                                    {(product.salePrice || product.price).toFixed(2)} DH
                                  </span>
                                  {product.salePrice && (
                                    <span className="text-sm text-gray-400 line-through ml-2">
                                      {product.price.toFixed(2)} DH
                                    </span>
                                  )}
                                  {hasDiscount && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      -{product.firstOrderRemisePct}% 1ère commande
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-between">
                                <button
                                  onClick={() => remove(item.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => decrease(item.id)}
                                    className="p-1 rounded border hover:bg-gray-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center font-bold">{item.quantity}</span>
                                  <button
                                    onClick={() => increase(item.id)}
                                    className="p-1 rounded border hover:bg-gray-100"
                                    disabled={item.quantity >= product.stockQty}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="font-bold text-lg">{itemTotal.toFixed(2)} DH</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 pt-4 border-t-2 mt-4">
                        <Button
                          onClick={handleConfirmOrder}
                          disabled={submitting}
                          className="flex-1 bg-[#f56a24] hover:bg-[#d45a1e] text-white py-4 text-lg font-semibold"
                        >
                          {submitting ? 'Envoi en cours...' : `Confirmer la commande (${calculateTotal().toFixed(2)} DH)`}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Loyalty Products Section */}
                  {loyaltyItems.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#f56a24] mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Produits de Fidélité ({loyaltyItems.length})
                      </h3>
                      <div className="space-y-4">
                        {loyaltyItems.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 border-2 border-orange-200 rounded-lg hover:border-[#f56a24] transition-all bg-orange-50/30"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-[#2C3B4D]">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-500">{item.description}</p>
                                )}
                                <div className="mt-2">
                                  <span className="text-lg font-bold text-[#f56a24]">
                                    {item.pointsCost} points/unité
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-between">
                                <button
                                  onClick={() => remove(item.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => decrease(item.id)}
                                    className="p-1 rounded border hover:bg-gray-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-12 text-center font-bold">{item.quantity}</span>
                                  <button
                                    onClick={() => increase(item.id)}
                                    className="p-1 rounded border hover:bg-gray-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="font-bold text-lg text-[#f56a24]">
                                  {(item.pointsCost || 0) * item.quantity} pts
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-4 pt-4 border-t-2 border-orange-200 mt-4">
                        <Button
                          onClick={handleConfirmLoyaltyOrder}
                          disabled={submittingLoyalty || loyaltyPoints < getTotalPoints()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:opacity-50"
                        >
                          {submittingLoyalty ? 'Envoi en cours...' : `Commander (${getTotalPoints()} points)`}
                        </Button>
                      </div>

                      {loyaltyPoints < getTotalPoints() && (
                        <p className="text-sm text-red-600 mt-2">
                          Points insuffisants. Il vous manque {getTotalPoints() - loyaltyPoints} points.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
