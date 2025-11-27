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
  const { items, increase, decrease, remove, clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'OPTICIAN') {
      router.push('/auth/signin');
      return;
    }
    fetchCartProducts();
    fetchOrderHistory();
  }, [session, status, router]);

  const fetchCartProducts = async () => {
    try {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = items.map(item => item.id);
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
    return items.reduce((sum, item) => {
      return sum + calculateItemTotal(item.id, item.quantity);
    }, 0);
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const orderItems = items.map(item => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C3B4D] flex items-center gap-3">
            <User className="h-10 w-10" />
            Mon Profil
          </h1>
          <p className="text-gray-600 mt-2">Gérez votre panier et suivez vos commandes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#2C3B4D] mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
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

            {/* Order Summary */}
            {items.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-[#2C3B4D] mb-4">Résumé de la commande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Articles</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantité totale</span>
                    <span className="font-medium">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#f56a24]">{calculateTotal().toFixed(2)} DH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#2C3B4D] mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Mon Panier ({items.length})
              </h2>

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
                <div className="space-y-4">
                  {items.map((item) => {
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

                  <div className="flex gap-4 pt-6 border-t-2">
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={submitting || items.length === 0}
                      className="flex-1 bg-[#f56a24] hover:bg-[#d45a1e] text-white py-4 text-lg font-semibold"
                    >
                      {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
