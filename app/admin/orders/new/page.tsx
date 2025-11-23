'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, MinusCircle, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface OpticianOption {
  id: string;
  businessName: string;
}

interface ProductOption {
  id: string;
  name: string;
  reference: string;
  stockQty: number;
  price: number;
  salePrice: number | null;
  inStock: boolean;
}

interface OrderLine {
  productId: string;
  quantity: string;
}

export default function AdminNewOrderPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [opticians, setOpticians] = useState<OpticianOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [opticianId, setOpticianId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([{ productId: '', quantity: '1' }]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/orders?mode=form');
        if (!res.ok) {
          throw new Error('Failed to load data');
        }
        const data = await res.json();
        setOpticians(data.opticians || []);
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setError(t.orderDataLoadError ?? 'Erreur lors du chargement des données.');
      } finally {
        setLoadingData(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [session, t]);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const handleLineChange = (index: number, field: keyof OrderLine, value: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { productId: '', quantity: '1' }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const validateLines = () => {
    if (!opticianId) {
      return t.selectOpticianRequired || t.selectOptician || 'Select optician';
    }

    const filledLines = lines.filter((line) => line.productId);
    if (filledLines.length === 0) {
      return t.orderNeedsProduct || t.noProductsAvailable || 'Add at least one product';
    }

    for (const line of filledLines) {
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return t.quantityPositiveError || t.quantityLabel || 'Quantity must be positive';
      }
      const product = productMap.get(line.productId);
      if (!product) {
        return t.unknownProductError || t.noProductsAvailable || 'Unknown product';
      }
      if (product.stockQty < qty) {
        return `${t.stockInsufficient ?? 'Not enough stock'} (${product.reference})`;
      }
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const validationError = validateLines();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        opticianId,
        items: lines
          .filter((line) => line.productId)
          .map((line) => ({ productId: line.productId, quantity: Number(line.quantity) })),
        note: note.trim() || undefined,
      };

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      router.push(`/admin/opticians/${opticianId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="bg-white shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-abyssal">{t.newOrder}</h1>
            <p className="text-sm text-gray-500">{t.manualOrderSubtitle}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium text-gray-700">{t.selectOptician}</label>
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={opticianId}
                  onChange={(e) => setOpticianId(e.target.value)}
                >
                  <option value="">--</option>
                  {opticians.length === 0 && (
                    <option value="" disabled>
                      {t.noOpticiansAvailable}
                    </option>
                  )}
                  {opticians.map((optician) => (
                    <option key={optician.id} value={optician.id}>
                      {optician.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{t.orderItems}</h2>
                    <p className="text-sm text-gray-500">{t.manualOrderHelper}</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t.addOrderLine}
                  </Button>
                </div>

                {lines.map((line, index) => {
                  const product = line.productId ? productMap.get(line.productId) : null;
                  return (
                    <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="flex-1">
                          <label className="text-xs uppercase text-gray-500">{t.productLabel}</label>
                          <select
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={line.productId}
                            onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                          >
                            <option value="">--</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id} disabled={!p.inStock}>
                                {p.reference} · {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full md:w-32">
                          <label className="text-xs uppercase text-gray-500">{t.quantityLabel}</label>
                          <input
                            type="number"
                            min={1}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          className="text-red-600 text-sm flex items-center gap-1"
                          onClick={() => removeLine(index)}
                          disabled={lines.length === 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                          {t.removeLine}
                        </button>
                      </div>

                      {product && (
                        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 flex flex-wrap gap-4">
                          <span>
                            {t.currentStock}: <strong>{product.stockQty}</strong>
                          </span>
                          <span>
                            {t.price}: <strong>{product.salePrice ?? product.price} DH</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t.orderNoteLabel}</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.orderNotePlaceholder}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/admin" className="inline-flex items-center text-sm text-gray-600">
                  {t.cancel}
                </Link>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t.submitOrder ?? t.createOrder}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
