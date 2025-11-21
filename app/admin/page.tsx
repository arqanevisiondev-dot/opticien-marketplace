'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Package, Mail, TrendingUp, FolderTree, Settings, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  totalOpticians: number;
  pendingOpticians: number;
  totalProducts: number;
  totalSuppliers: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalOpticians: 0,
    pendingOpticians: 0,
    totalProducts: 0,
    totalSuppliers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Protection: Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t.opticians,
      value: stats.totalOpticians,
      icon: Users,
      color: 'bg-burning-flame',
      link: '/admin/opticians',
    },
    {
      title: t.pending,
      value: stats.pendingOpticians,
      icon: TrendingUp,
      color: 'bg-truffle-trouble',
      link: '/admin/opticians?filter=pending',
    },
    {
      title: t.products,
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-fantastic',
      link: '/catalogue',
    },
  ];

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-abyssal mb-2">{t.adminDashboard}</h1>
          <p className="text-gray-600">{t.ctaSubtitle}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statCards.map((card) => (
                <Link key={card.title} href={card.link}>
                  <div className="bg-white p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${card.color} w-12 h-12 flex items-center justify-center`}>
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-abyssal">{card.value}</div>
                    </div>
                    <h3 className="text-gray-600 font-medium">{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-abyssal mb-6">{t.quickActions}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Link href="/admin/opticians">
                  <Button variant="primary" className="w-full flex items-center justify-center">
                    <Users className="mr-2 h-4 w-4" />
                    {t.manageOpticians}
                  </Button>
                </Link>
                <Link href="/admin/categories">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <FolderTree className="mr-2 h-4 w-4" />
                    {t.manageCategories}
                  </Button>
                </Link>
                <Link href="/admin/products/new">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <Package className="mr-2 h-4 w-4" />
                    {t.newProduct}
                  </Button>
                </Link>
                <Link href="/admin/orders/new">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {t.newOrder}
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <Package className="mr-2 h-4 w-4" />
                    {t.editProducts}
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t.productOptions}
                  </Button>
                </Link>
                <Link href="/admin/campaigns">
                  <Button variant="secondary" className="w-full flex items-center justify-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {t.emailCampaigns}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-abyssal mb-6">{t.recentActivity}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-burning-flame w-10 h-10 flex items-center justify-center mr-4">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-abyssal">{t.newOpticianRegistration}</p>
                      <p className="text-sm text-gray-500">{t.hoursAgo}</p>
                    </div>
                  </div>
                  <Link href="/admin/opticians?status=pending">
                    <Button variant="outline" size="sm">{t.view}</Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-blue-fantastic w-10 h-10 flex items-center justify-center mr-4">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-abyssal">{t.newProductAdded}</p>
                      <p className="text-sm text-gray-500">{t.hoursAgo}</p>
                    </div>
                  </div>
                  <Link href="/admin/products/new">
                    <Button variant="outline" size="sm">{t.view}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
