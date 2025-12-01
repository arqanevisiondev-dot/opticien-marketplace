'use client'

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CartBar() {
  const { items, clear, remove, increase, decrease } = useCart();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isOptician = session?.user?.role === 'OPTICIAN';
  const businessName = (session?.user as unknown as { opticianBusinessName?: string })?.opticianBusinessName;
  const [fetchedBusinessName, setFetchedBusinessName] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (isOptician) {
      fetch('/api/me/optician')
        .then((r) => (r.ok ? r.json() : { businessName: null }))
        .then((data: { businessName?: string | null }) => {
          if (!active) return;
          if (data && typeof data.businessName === 'string' && data.businessName.trim()) {
            setFetchedBusinessName(data.businessName);
          } else if (businessName) {
            setFetchedBusinessName(businessName);
          }
        })
        .catch(() => {
          if (active && businessName) setFetchedBusinessName(businessName);
        });
    } else {
      setFetchedBusinessName(undefined);
    }
    return () => {
      active = false;
    };
  }, [isOptician, businessName]);

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    
    setLoading(true);
    setMessage(null);

    try {
      // Fetch product details to calculate prices
      const productIds = items.map(item => item.id);
      const productsResponse = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: productIds }),
      });

      if (!productsResponse.ok) {
        throw new Error('Failed to fetch product details');
      }

      const products = await productsResponse.json();
      
      // Build order items with pricing
      const orderItems = items.map(item => {
        const product = products.find((p: any) => p.id === item.id);
        if (!product) {
          throw new Error(`Product ${item.id} not found`);
        }

        const unitPrice = product.salePrice || product.price;
        const totalLine = unitPrice * item.quantity;

        return {
          productId: item.id,
          productName: item.name,
          productReference: item.reference,
          quantity: item.quantity,
          unitPrice,
          salePrice: product.salePrice || 0,
          remisePct: product.firstOrderRemisePct || 0,
          totalLine,
        };
      });

      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalLine, 0);

      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, totalAmount }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const result = await orderResponse.json();
      
      setMessage({ type: 'success', text: t.orderSuccess });
      clear();
      
      // Hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage({ type: 'error', text: t.orderError });
    } finally {
      setLoading(false);
    }
  };

  if (!isOptician) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white shadow-xl border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3">
        <button className="text-sm underline" onClick={() => setOpen((v) => !v)}>
          {open ? t.closeCart : t.cartDetails}
        </button>
        <div className="text-sm">{t.cartSelection} <span className="font-semibold">{items.length}</span></div>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={!items.length || loading}
        >
          {t.clearCart}
        </Button>
        <Button 
          variant="primary" 
          size="sm" 
          disabled={!items.length || loading}
          onClick={handlePlaceOrder}
        >
          {loading ? t.creatingOrder : t.placeOrder}
        </Button>
      </div>
      {message && (
        <div className={`mt-2 text-center text-sm px-4 py-2 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      {open && (
        <div className="mt-2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 max-w-[90vw] w-[640px]">
          <div className="max-h-60 overflow-auto space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-gray-500">{t.noProductsSelected}</div>
            ) : (
              items.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-gray-500">{t.ref} {i.reference}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => decrease(i.id)}>-</Button>
                    <div className="w-8 text-center">{i.quantity}</div>
                    <Button variant="outline" size="sm" onClick={() => increase(i.id)}>+</Button>
                    <Button variant="outline" size="sm" onClick={() => remove(i.id)}>{t.removeFromCart}</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
