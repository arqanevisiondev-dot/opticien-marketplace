// app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse" />,
});

export default function SignUpPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const handleLocationSelect = (data: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    postalCode: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      latitude: data.lat,
      longitude: data.lng,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordsDoNotMatch);
      setLoading(false);
      return;
    }

    // Validate location is selected
    if (!formData.latitude || !formData.longitude) {
      setError('Veuillez sélectionner votre emplacement sur la carte');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      router.push('/auth/signup/success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-palladian py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-abyssal">
            {t.signupTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/auth/signin" className="font-medium text-blue-fantastic hover:text-burning-flame">
              {t.signInLink}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t.firstName} *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t.lastName} *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                {t.businessName} *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.professionalEmail} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
              />
            </div>

            {/* Phone Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t.phone} *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  {t.whatsapp} {t.optional}
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
            </div>

            {/* Location Picker Section - THIS AUTO-FILLS EVERYTHING */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Emplacement Exact *</span>
                  {formData.latitude && <span className="text-green-600 font-bold">✓</span>}
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  {showMap ? 'Masquer' : 'Sélectionner'}
                </button>
              </div>
              
              {formData.latitude && formData.longitude && !showMap && (
                <div className="bg-green-50 border border-green-300 p-3 rounded-lg space-y-1">
                  <p className="text-green-800 font-semibold text-sm">✓ Position enregistrée</p>
                  {formData.address && (
                    <p className="text-green-700 text-xs">🏠 {formData.address}</p>
                  )}
                  {formData.city && (
                    <p className="text-green-700 text-xs">🏙️ {formData.city}</p>
                  )}
                  {formData.postalCode && (
                    <p className="text-green-700 text-xs">📮 {formData.postalCode}</p>
                  )}
                </div>
              )}

              {showMap && (
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude || 33.9716}
                  initialLng={formData.longitude || -6.8498}
                  initialCity={formData.city}
                />
              )}
              
              {!formData.latitude && (
                <p className="text-xs text-gray-600 mt-2">
                  ℹ️ La ville, l'adresse et le code postal seront remplis automatiquement
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.password} *
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t.confirmPassword} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-fantastic focus:border-blue-fantastic"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-fantastic focus:ring-blue-fantastic border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              {t.acceptTermsPrefix} {' '}
              <Link href="/legal/terms" className="text-blue-fantastic hover:text-burning-flame">
                {t.termsConditions}
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? t.signupLoading : t.createAccountButton}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {t.pendingApprovalMessage}
          </p>
        </form>
      </div>
    </div>
  );
}