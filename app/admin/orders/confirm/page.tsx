'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  salePrice?: number;
  totalLine: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  product: {
    stockQty: number;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  optician: {
    businessName: string;
    phone: string;
    user: {
      email: string;
    };
  };
  items: OrderItem[];
}

export default function ConfirmOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders/pending');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmItem = async (itemId: string, action: 'confirm' | 'cancel') => {
    setConfirmingId(itemId);
    try {
      const response = await fetch(`/api/admin/orders/confirm-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la confirmation');
      }
    } catch (error) {
      console.error('Error confirming item:', error);
      alert('Erreur lors de la confirmation');
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
            <Clock className="h-4 w-4" />
            {t.pendingStatus}
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            {t.confirmed}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            <XCircle className="h-4 w-4" />
            {t.cancelledStatus}
          </span>
        );
      default:
        return null;
    }
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
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2C3B4D]">{t.confirmOrders}</h1>
          <p className="text-gray-600 mt-2">
            {t.confirmOrdersSubtitle}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noPendingOrders}</h3>
            <p className="text-gray-500">{t.allOrdersProcessed}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-6 py-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-xl font-bold">{order.optician.businessName}</h2>
                      <p className="text-sm text-gray-300">
                        {order.optician.user.email} • {order.optician.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">{t.orderNumber}{order.id.slice(0, 8)}</p>
                      <p className="text-lg font-bold">{order.totalAmount.toFixed(2)} DH</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                          item.status === 'PENDING'
                            ? 'border-orange-200 bg-orange-50'
                            : item.status === 'CONFIRMED'
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2C3B4D]">{item.productName}</h3>
                          <p className="text-sm text-gray-600">{t.reference}: {item.productReference}</p>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm">
                              <span className="font-medium">{t.quantity}:</span> {item.quantity}
                            </span>
                            <span className="text-sm">
                              <span className="font-medium">{t.unitPrice}:</span>{' '}
                              {(item.salePrice || item.unitPrice).toFixed(2)} DH
                            </span>
                            <span className="text-sm font-bold text-[#f56a24]">
                              {t.total}: {item.totalLine.toFixed(2)} DH
                            </span>
                            <span className="text-sm text-gray-600">
                              {t.availableStock}: {item.product.stockQty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}

                          {item.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleConfirmItem(item.id, 'confirm')}
                                disabled={
                                  confirmingId === item.id || item.product.stockQty < item.quantity
                                }
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {confirmingId === item.id ? t.confirming : t.confirm}
                              </Button>
                              <Button
                                onClick={() => handleConfirmItem(item.id, 'cancel')}
                                disabled={confirmingId === item.id}
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                size="sm"
                              >
                                <XCircle className="h-4 w-4" />
                                {t.cancelAction}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
