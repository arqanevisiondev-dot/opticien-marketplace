'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Calendar,
  Tag,
  Sparkles,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  type: 'NEWS' | 'PRODUCT' | 'PROMOTION' | 'ANNOUNCEMENT';
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export default function SliderManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    type: 'NEWS' as Slide['type'],
    linkUrl: '',
    linkText: '',
    isActive: true,
    order: 0,
    startDate: '',
    endDate: '',
    backgroundColor: '#1b2632',
    textColor: '#ffffff',
    buttonColor: '#f56a24',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchSlides();
    }
  }, [session, status, router]);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/admin/slides');
      const data = await response.json();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSlide
        ? `/api/admin/slides/${editingSlide.id}`
        : '/api/admin/slides';
      
      const method = editingSlide ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSlides();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette diapositive ?')) return;

    try {
      const response = await fetch(`/api/admin/slides/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const toggleActive = async (slide: Slide) => {
    try {
      const response = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...slide, isActive: !slide.isActive }),
      });

      if (response.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const editSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      imageUrl: slide.imageUrl,
      type: slide.type,
      linkUrl: slide.linkUrl || '',
      linkText: slide.linkText || '',
      isActive: slide.isActive,
      order: slide.order,
      startDate: slide.startDate || '',
      endDate: slide.endDate || '',
      backgroundColor: slide.backgroundColor || '#1b2632',
      textColor: slide.textColor || '#ffffff',
      buttonColor: slide.buttonColor || '#f56a24',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      type: 'NEWS',
      linkUrl: '',
      linkText: '',
      isActive: true,
      order: 0,
      startDate: '',
      endDate: '',
      backgroundColor: '#1b2632',
      textColor: '#ffffff',
      buttonColor: '#f56a24',
    });
    setEditingSlide(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burning-flame"></div>
      </div>
    );
  }

  const typeIcons = {
    NEWS: Calendar,
    PRODUCT: Tag,
    PROMOTION: Sparkles,
    ANNOUNCEMENT: Calendar,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestion du Slider</h1>
            <p className="text-gray-600 mt-2">Gérer les diapositives de la page d'accueil</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Diapositive</span>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSlide ? 'Modifier la Diapositive' : 'Nouvelle Diapositive'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Slide['type'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    >
                      <option value="NEWS">Actualité</option>
                      <option value="PRODUCT">Produit</option>
                      <option value="PROMOTION">Promotion</option>
                      <option value="ANNOUNCEMENT">Annonce</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL du lien
                    </label>
                    <input
                      type="text"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                      placeholder="/catalogue ou https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={formData.linkText}
                      onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                      placeholder="En savoir plus"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de fond
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur du texte
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur du bouton
                    </label>
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordre
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-burning-flame rounded focus:ring-burning-flame"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Activer la diapositive
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" className="flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>{editingSlide ? 'Mettre à jour' : 'Créer'}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slides List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {slides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune diapositive trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {slides.map((slide) => {
                const TypeIcon = typeIcons[slide.type];
                return (
                  <div
                    key={slide.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex items-center space-x-4"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          <TypeIcon className="w-3 h-3" />
                          <span>{slide.type}</span>
                        </div>
                      </div>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-600">{slide.subtitle}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Ordre: {slide.order}</span>
                        {slide.startDate && <span>Début: {new Date(slide.startDate).toLocaleDateString()}</span>}
                        {slide.endDate && <span>Fin: {new Date(slide.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(slide)}
                        className={`p-2 rounded-lg transition-colors ${
                          slide.isActive
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={slide.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {slide.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => editSlide(slide)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
