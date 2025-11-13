'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ category: Category; force: boolean } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [session, status, router]);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        setFilteredCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur');
      }

      setSuccess(editingCategory ? t.categoryUpdated : t.categoryCreated);
      handleCloseModal();
      fetchCategories();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ category, force: false });
  };

  const handleDelete = async (force: boolean = false) => {
    if (!deleteConfirm) return;

    try {
      const url = `/api/admin/categories/${deleteConfirm.category.id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        if (data.canForceDelete) {
          // Show force delete option
          setDeleteConfirm({ ...deleteConfirm, force: true });
          return;
        }
        throw new Error(data.error || 'Erreur');
      }

      setSuccess(t.categoryDeleted);
      setDeleteConfirm(null);
      fetchCategories();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToDashboard}
          </Button>
        </Link>

        <div className="bg-white shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-abyssal">{t.manageCategories}</h1>
            <Button
              onClick={() => handleOpenModal()}
              variant="primary"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.newCategory}
            </Button>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded">
              {success}
            </div>
          )}

          {error && !showModal && !deleteConfirm && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchCategory}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? t.noCategories : t.noCategories}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.categoryName}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.categoryDescription}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.productCount}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="h-4 w-4 mr-2 text-blue-fantastic" />
                          {category._count.products}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-blue-fantastic hover:text-burning-flame mr-4"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-abyssal mb-6">
              {editingCategory ? t.editCategory : t.newCategory}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categoryName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="Montures de soleil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categoryDescription}
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-fantastic focus:border-transparent"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingCategory ? t.updateCategory : t.createCategory}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-abyssal mb-4">
              {t.confirmDelete}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 rounded text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-4">
              {deleteConfirm.category._count.products > 0 ? (
                <>
                  {t.categoryHasProducts.replace('{count}', deleteConfirm.category._count.products.toString())}
                  <br />
                  <br />
                  {deleteConfirm.force ? (
                    <span className="text-red-600 font-medium">{t.forceDeleteWarning}</span>
                  ) : (
                    <span className="text-red-600">{t.cannotDeleteCategory}</span>
                  )}
                </>
              ) : (
                `${t.deleteCategory}: "${deleteConfirm.category.name}" ?`
              )}
            </p>

            <div className="flex gap-4">
              {deleteConfirm.force || deleteConfirm.category._count.products === 0 ? (
                <Button
                  onClick={() => handleDelete(deleteConfirm.force)}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteConfirm.force ? t.forceDelete : t.delete}
                </Button>
              ) : (
                <Button
                  onClick={() => setDeleteConfirm({ ...deleteConfirm, force: true })}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {t.forceDelete}
                </Button>
              )}
              <Button
                onClick={() => {
                  setDeleteConfirm(null);
                  setError('');
                }}
                variant="outline"
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
