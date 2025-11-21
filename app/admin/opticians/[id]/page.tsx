'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, X, ArrowLeft } from 'lucide-react';

interface OpticianAnalytics {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  totalItemsValidated: number;
  lastOrderAt: string | null;
  lastOrderStatus: string | null;
}

interface OpticianDetail {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  analytics?: OpticianAnalytics;
}

export default function AdminOpticianDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const getText = (key: string, fallback: string) => (t as Record<string, string | undefined>)[key] ?? fallback;
  const [optician, setOptician] = useState<OpticianDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/admin/opticians/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOptician(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session, id, router]);

  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/opticians/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOptician((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch {}
  };

  const getStatusBadge = (s: string) => {
    const styles = {
      PENDING: 'bg-burning-flame text-white',
      APPROVED: 'bg-green-500 text-white',
      REJECTED: 'bg-red-500 text-white',
    } as const;
    return styles[s as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/opticians">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.manageOpticians}
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
          </div>
        ) : optician ? (
          <div className="bg-white p-6 shadow-lg space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-abyssal mb-4">{optician.businessName}</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.contactInfo}</div>
                  <div className="text-gray-900">{optician.firstName} {optician.lastName}</div>
                  <div className="text-gray-900">{optician.phone}</div>
                  <div className="text-gray-900">{optician.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t.status}</div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold ${getStatusBadge(optician.status)}`}>
                    {optician.status === 'PENDING' ? t.pending : optician.status === 'APPROVED' ? t.approved : t.rejected}
                  </span>
                  <div className="text-sm text-gray-500 mt-2">
                    {getText('registrationDate', 'Date d’inscription')}: <span className="text-gray-900">{new Date(optician.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {optician.status === 'PENDING' && (
                <div className="mt-6 flex gap-2">
                  <Button variant="primary" onClick={() => handleStatusChange('APPROVED')} className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    {t.approve}
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange('REJECTED')} className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    {(t.reject as string | undefined) ?? 'Reject'}
                  </Button>
                </div>
              )}
            </div>

            {optician.analytics && (
              <div>
                <h2 className="text-2xl font-semibold text-abyssal mb-4">{getText('analytics', 'Analytics')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    {
                      label: getText('totalOrders', 'Total Orders'),
                      value: optician.analytics.totalOrders,
                      sub: getText('ordersAllTime', 'All Time'),
                    },
                    {
                      label: getText('validated', 'Validated'),
                      value: optician.analytics.approvedOrders,
                      sub: getText('ordersApproved', 'Approved'),
                    },
                    {
                      label: t.pending,
                      value: optician.analytics.pendingOrders,
                      sub: getText('ordersPending', 'Pending'),
                    },
                    {
                      label: t.rejected,
                      value: optician.analytics.rejectedOrders,
                      sub: getText('ordersRejected', 'Rejected'),
                    },
                  ] as const).map((card) => (
                    <div key={card.label} className="border border-gray-100 rounded-lg p-4 shadow-sm bg-gray-50">
                      <div className="text-sm text-gray-500">{card.label}</div>
                      <div className="text-3xl font-bold text-abyssal">{card.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">{getText('totalItems', 'Total Items')}</div>
                    <div className="text-4xl font-bold text-abyssal">{optician.analytics.totalItemsValidated}</div>
                    <div className="text-xs text-gray-500 mt-1">{getText('totalItemsSubtitle', 'Total Items Subtitle')}</div>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">{getText('lastOrder', 'Last Order')}</div>
                    {optician.analytics.lastOrderAt ? (
                      <>
                        <div className="text-xl font-semibold text-abyssal">{new Date(optician.analytics.lastOrderAt).toLocaleString()}</div>
                        <div className="text-sm text-gray-500 mt-1">{getText('status', 'Status')}: {optician.analytics.lastOrderStatus ?? t.pending ?? 'Pending'}</div>
                      </>
                    ) : (
                      <div className="text-gray-600">{getText('noOrders', 'No Orders')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">{getText('noOpticianFound', 'No Optician Found')}</div>
        )}
      </div>
    </div>
  );
}
