'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, X, Eye, Search } from 'lucide-react';

interface Optician {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminOpticiansPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opticians, setOpticians] = useState<Optician[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Protection: Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    fetchOpticians();
  }, [session, status, router]);

  const fetchOpticians = async () => {
    try {
      const res = await fetch('/api/admin/opticians');
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error fetching opticians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/opticians/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOpticians(opticians.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (error) {
      console.error('Error updating optician status:', error);
    }
  };

  const filteredOpticians = opticians.filter(o => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = 
      o.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-burning-flame text-white',
      APPROVED: 'bg-green-500 text-white',
      REJECTED: 'bg-red-500 text-white',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-abyssal mb-8">{t.opticianManagement}</h1>

        {/* Filters */}
        <div className="bg-white p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchOptician}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'ALL' ? t.all : status === 'PENDING' ? t.pending : status === 'APPROVED' ? t.approved : t.rejected}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
          </div>
        ) : (
          <div className="bg-white shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-fantastic">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t.business}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t.contactInfo}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t.email}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOpticians.map((optician) => (
                  <tr key={optician.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{optician.businessName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {optician.firstName} {optician.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{optician.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {optician.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold ${getStatusBadge(optician.status)}`}>
                        {optician.status === 'PENDING' ? t.pending : optician.status === 'APPROVED' ? t.approved : t.rejected}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {optician.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(optician.id, 'APPROVED')}
                            className="text-green-600 hover:text-green-900"
                            title={t.approve}
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(optician.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900"
                            title={t.reject}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title={t.viewDetails}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOpticians.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {t.noOpticianFound}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
