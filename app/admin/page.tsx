'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  totalOpticians: number;
  pendingOpticians: number;
  totalProducts: number;
  totalSuppliers: number;
  totalArticles: number;
}

interface RecentRegistration {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string | null;
  status: string;
  createdAt: string;
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
    totalArticles: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Protection: Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchStats();
    fetchRecentRegistrations();
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

  const fetchRecentRegistrations = async () => {
    try {
      const res = await fetch('/api/admin/opticians/recent');
      const data = await res.json();
      setRecentRegistrations(data.recentRegistrations || []);
    } catch (error) {
      console.error('Error fetching recent registrations:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
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
      title: t.totalOrders,
      value: stats.totalArticles,
      icon: Package,
      color: 'bg-blue-fantastic',
      link: '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.adminDashboard}</h1>
          <p className="text-gray-600">{t.ctaSubtitle}</p>
        </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((card) => (
                  <Link key={card.title} href={card.link}>
                    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center shadow-lg`}>
                          <card.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                          <div className="text-xs text-gray-500 mt-1">Total</div>
                        </div>
                      </div>
                      <h3 className="text-gray-700 font-semibold text-lg">{card.title}</h3>
                      <div className="mt-3 flex items-center text-sm text-blue-600">
                        <span>{t.seeDetails}</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.recentActivity}</h2>
              
              {recentRegistrations.length > 0 ? (
                <div className="space-y-3">
                  {recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className="flex items-center">
                        <div className={`${registration.status === 'PENDING' ? 'bg-yellow-500' : 'bg-blue-600'} w-12 h-12 flex items-center justify-center mr-4 rounded-full shadow-md`}>
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {registration.businessName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {registration.firstName} {registration.lastName} - {registration.city || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeAgo(registration.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {registration.status === 'PENDING' && (
                          <span className="px-3 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            {t.pending}
                          </span>
                        )}
                        <Link href={`/admin/opticians?filter=${registration.status.toLowerCase()}`}>
                          <Button variant="outline" size="sm">{t.view}</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>{t.noRecentActivity}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
