'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map/OpticianMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse flex items-center justify-center">Chargement de la carte...</div>,
});

interface Optician {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface NearestOpticianFinderProps {
  productName?: string;
}

export default function NearestOpticianFinder({ productName }: NearestOpticianFinderProps) {
  const { t } = useLanguage();
  const { latitude, longitude, error: geoError, loading: geoLoading, permission, requestLocation } = useGeolocation();
  const [opticians, setOpticians] = useState<Optician[]>([]);
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch available cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch opticians when location is available
  useEffect(() => {
    if (latitude && longitude) {
      fetchNearestOpticians(latitude, longitude);
    }
  }, [latitude, longitude]);

  // Filter cities based on search input
  useEffect(() => {
    if (citySearch.trim()) {
      const filtered = availableCities.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [citySearch, availableCities]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/opticians/cities');
      const data = await res.json();
      setAvailableCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchNearestOpticians = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opticians/nearest?latitude=${lat}&longitude=${lon}&limit=5`);
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error fetching nearest opticians:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async () => {
    if (!citySearch.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`/api/opticians/nearest?city=${encodeURIComponent(citySearch)}&limit=10`);
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error searching opticians by city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setCitySearch(city);
    setShowSuggestions(false);
    // Automatically search when a city is selected
    setTimeout(() => {
      searchByCityName(city);
    }, 100);
  };

  const searchByCityName = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opticians/nearest?city=${encodeURIComponent(city)}&limit=10`);
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error searching opticians by city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    setShowCitySearch(false);
    requestLocation();
  };

  const handleShowCitySearch = () => {
    setShowCitySearch(true);
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="bg-white shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-abyssal mb-4">
        {t.findNearestOptician || 'Trouver un opticien près de chez vous'}
      </h2>
      
      {productName && (
        <p className="text-gray-600 mb-4">
          {t.findOpticianForProduct || 'Trouvez un opticien qui peut vous fournir'} <span className="font-semibold">{productName}</span>
        </p>
      )}

      {/* Location Request Section */}
      {!latitude && !longitude && !showCitySearch && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-4">
              {t.allowLocationAccess || 'Autorisez l\'accès à votre position pour trouver les opticiens les plus proches de vous.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={handleRequestLocation}
                disabled={geoLoading}
                className="flex items-center justify-center"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.loading}...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    {t.useMyLocation || 'Utiliser ma position'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleShowCitySearch}
                className="flex items-center justify-center"
              >
                <Search className="mr-2 h-4 w-4" />
                {t.searchByCity || 'Rechercher par ville'}
              </Button>
            </div>
          </div>

          {geoError && permission === 'denied' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                {t.locationDenied || 'Accès à la localisation refusé. Vous pouvez rechercher par ville ci-dessous.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShowCitySearch}
                className="mt-2"
              >
                {t.searchByCity || 'Rechercher par ville'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* City Search Section */}
      {(showCitySearch || (geoError && !latitude)) && (
        <div className="mb-6">
          <div className="flex gap-2">
            <div ref={searchRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                type="text"
                placeholder={t.enterCity || 'Entrez le nom de la ville...'}
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByCity()}
                onFocus={() => citySearch.trim() && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
              />
              
              {/* City Suggestions Dropdown */}
              {showSuggestions && filteredCities.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-800">{city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="primary"
              onClick={searchByCity}
              disabled={loading || !citySearch.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.search}
            </Button>
          </div>
          {!geoError && (
            <button
              onClick={handleRequestLocation}
              className="text-sm text-blue-fantastic hover:underline mt-2"
            >
              {t.useMyLocation || 'Utiliser ma position'}
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-fantastic" />
          <p className="mt-2 text-gray-600">{t.searchingOpticians || 'Recherche des opticiens...'}</p>
        </div>
      )}

      {/* Results */}
      {!loading && opticians.length > 0 && (
        <>
          {/* View Toggle */}
          <div className="flex gap-4 mb-4">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              {t.listView || 'Liste'}
            </Button>
            <Button
              variant={viewMode === 'map' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex items-center"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {t.mapView || 'Carte'}
            </Button>
          </div>

          {viewMode === 'map' ? (
            <div className="mb-4">
              <MapComponent opticians={opticians} />
            </div>
          ) : (
            <div className="space-y-4">
              {opticians.map((optician) => (
                <div key={optician.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-abyssal">{optician.businessName}</h3>
                      <p className="text-sm text-gray-600">
                        {optician.firstName} {optician.lastName}
                      </p>
                    </div>
                    {optician.distance !== undefined && (
                      <div className="bg-blue-50 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-blue-fantastic">
                          {optician.distance.toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  {optician.address && (
                    <div className="flex items-start mb-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <div>{optician.address}</div>
                        <div>{optician.postalCode} {optician.city}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a href={`tel:${optician.phone}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full flex items-center justify-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {t.call || 'Appeler'}
                      </Button>
                    </a>
                    {optician.whatsapp && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center"
                        onClick={() => handleWhatsAppClick(optician.whatsapp!)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && opticians.length === 0 && (latitude || citySearch) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {t.noOpticianFound || 'Aucun opticien trouvé dans cette zone.'}
          </p>
        </div>
      )}
    </div>
  );
}
