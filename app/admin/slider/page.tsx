'use client';

import { useState, useEffect, useRef } from 'react';
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
  Upload,
  Smartphone,
  Tablet,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext'
import ImageCropper from '@/components/admin/ImageCropper';

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  imageUrlTablet?: string;
  imageUrlMobile?: string;
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
  const { t } = useLanguage()
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Preview states for responsiveness
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewTablet, setImagePreviewTablet] = useState<string | null>(null);
  const [imagePreviewMobile, setImagePreviewMobile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    imageUrlTablet: '',
    imageUrlMobile: '',
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
      imageUrlTablet: slide.imageUrlTablet || '',
      imageUrlMobile: slide.imageUrlMobile || '',
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
    // Set previews
    setImagePreview(slide.imageUrl);
    setImagePreviewTablet(slide.imageUrlTablet || null);
    setImagePreviewMobile(slide.imageUrlMobile || null);

    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      imageUrlTablet: '',
      imageUrlMobile: '',
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
    setImagePreview(null);
    setImagePreviewTablet(null);
    setImagePreviewMobile(null);
    setSelectedFile(null);
    setShowCropper(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);

    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (crops: {
    desktop: string
    tablet: string
    mobile: string
  }) => {
    setFormData({
      ...formData,
      imageUrl: crops.desktop,
      imageUrlTablet: crops.tablet,
      imageUrlMobile: crops.mobile
    });

    setImagePreview(crops.desktop);
    setImagePreviewTablet(crops.tablet);
    setImagePreviewMobile(crops.mobile);

    setShowCropper(false);
    setSelectedFile(null);
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
            <h1 className="text-4xl font-bold text-gray-900">{t.sliderPageTitle}</h1>
            <p className="text-gray-600 mt-2">{t.sliderPageSubtitle}</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t.sliderNewButton}</span>
          </Button>
        </div>

        {/* Image Cropper Modal */}
        {showCropper && selectedFile && (
          <ImageCropper
            imageFile={selectedFile}
            onCancel={() => {
              setShowCropper(false);
              setSelectedFile(null);
            }}
            onCropComplete={handleCropComplete}
          />
        )}

        {/* Form Modal */}
        {showForm && !showCropper && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSlide ? t.sliderEditTitle : t.sliderNewTitle}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sliderLabelTitle + ' *'}
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
                      {t.sliderLabelType + ' *'}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Slide['type'] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                    >
                      <option value="NEWS">{t.sliderTypeNews}</option>
                      <option value="PRODUCT">{t.sliderTypeProduct}</option>
                      <option value="PROMOTION">{t.sliderTypePromotion}</option>
                      <option value="ANNOUNCEMENT">{t.sliderTypeAnnouncement}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.sliderLabelSubtitle}
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
                    {t.sliderLabelDescription}
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
                    {t.sliderLabelImage + ' *'}
                  </label>

                  {/* Image Reviews */}
                  {(imagePreview || imagePreviewTablet || imagePreviewMobile) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="relative group">
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>Bureau</span>
                        </div>
                        <img
                          src={imagePreview || ''}
                          alt="Desktop Preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      {imagePreviewTablet && (
                        <div className="relative group">
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                            <Tablet className="w-3 h-3" />
                            <span>Tablette</span>
                          </div>
                          <img
                            src={imagePreviewTablet}
                            alt="Tablet Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      {imagePreviewMobile && (
                        <div className="relative group">
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                            <Smartphone className="w-3 h-3" />
                            <span>Mobile</span>
                          </div>
                          <img
                            src={imagePreviewMobile}
                            alt="Mobile Preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      {(imagePreview || imagePreviewTablet || imagePreviewMobile) && (
                        <div className="col-span-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImagePreviewTablet(null);
                              setImagePreviewMobile(null);
                              setFormData({
                                ...formData,
                                imageUrl: '',
                                imageUrlTablet: '',
                                imageUrlMobile: ''
                              });
                            }}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Supprimer les images
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-burning-flame hover:bg-orange-50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {t.sliderNewButton || 'Sélectionner une image'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">Format recommandé : haute résolution</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sliderLabelLinkUrl}
                    </label>
                    <input
                      type="text"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                      placeholder={t.sliderPlaceholderLinkUrl}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sliderLabelLinkText}
                    </label>
                    <input
                      type="text"
                      value={formData.linkText}
                      onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burning-flame focus:border-transparent"
                      placeholder={t.sliderPlaceholderLinkText}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sliderLabelBackgroundColor}
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
                      {t.sliderLabelTextColor}
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
                      {t.sliderLabelButtonColor}
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
                      {t.sliderLabelOrder}
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
                      {t.sliderLabelStartDate}
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
                      {t.sliderLabelEndDate}
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
                    {t.sliderActivateSlide}
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    {t.sliderCancel}
                  </Button>
                  <Button type="submit" className="flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>{editingSlide ? t.sliderUpdate : t.sliderCreate}</span>
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
              <p className="text-gray-500">{t.sliderNoSlidesFound}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {slides.map((slide) => {
                const TypeIcon = typeIcons[slide.type];
                const typeLabels: Record<Slide['type'], string> = {
                  NEWS: t.sliderTypeNews,
                  PRODUCT: t.sliderTypeProduct,
                  PROMOTION: t.sliderTypePromotion,
                  ANNOUNCEMENT: t.sliderTypeAnnouncement,
                }
                return (
                  <div
                    key={slide.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex items-center space-x-4"
                  >

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
                          <span>{typeLabels[slide.type]}</span>
                        </div>
                      </div>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-600">{slide.subtitle}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{t.sliderPrefixOrder}{slide.order}</span>
                        {slide.startDate && <span>{t.sliderStart} {new Date(slide.startDate).toLocaleDateString()}</span>}
                        {slide.endDate && <span>{t.sliderEnd} {new Date(slide.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(slide)}
                        className={`p-2 rounded-lg transition-colors ${slide.isActive
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
