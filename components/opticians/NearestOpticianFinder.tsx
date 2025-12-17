'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Search, Navigation, Phone, MessageCircle, Loader2, Car, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { groupByCity, sortCitiesByDistance, formatDistance } from '@/lib/geolocation';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/map/OpticianMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse flex items-center justify-center">Chargement de la carte...</div>,
});

interface RouteInfo {
  drivingDistance: number; // in km
  drivingTime: number; // in minutes
  walkingTime: number; // in minutes
}

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
  routeInfo?: RouteInfo;
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
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'distance' | 'city'>('distance');
  const [groupByCityEnabled, setGroupByCityEnabled] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredOpticians = useMemo(() => {
    if (!latitude || !longitude) return opticians;
    
    return opticians.filter(opt => {
      if (opt.distance === undefined) return true;
      return opt.distance <= searchRadius;
    });
  }, [opticians, searchRadius, latitude, longitude]);

  const sortedOpticians = useMemo(() => {
    const toSort = [...filteredOpticians];
    
    if (sortBy === 'distance') {
      return toSort.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    } else {
      return toSort.sort((a, b) => {
        const cityA = a.city || 'ZZZ';
        const cityB = b.city || 'ZZZ';
        if (cityA !== cityB) return cityA.localeCompare(cityB);
        
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }
  }, [filteredOpticians, sortBy]);

  const groupedOpticians = useMemo(() => {
    if (!groupByCityEnabled) return null;
    
    const groups = groupByCity(sortedOpticians);
    const sortedCities = sortCitiesByDistance(groups);
    
    return { groups, cities: sortedCities };
  }, [sortedOpticians, groupByCityEnabled]);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearestOpticians(latitude, longitude);
    }
  }, [latitude, longitude, searchRadius]);

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

  // Fetch routes when GPS location is available
  useEffect(() => {
    if (latitude && longitude && opticians.length > 0) {
      calculateRoutesForOpticians(latitude, longitude);
    }
  }, [latitude, longitude, opticians.length]);

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
      const res = await fetch(`/api/opticians/nearest?latitude=${lat}&longitude=${lon}&radius=${searchRadius}&limit=100`);
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error fetching nearest opticians:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoutesForOpticians = async (userLat: number, userLng: number) => {
    setRoutesLoading(true);
    
    // Get top 5 opticians with coordinates
    const opticiansToRoute = opticians
      .filter(opt => opt.latitude && opt.longitude && opt.distance !== undefined)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 5);

    const routePromises = opticiansToRoute.map(async (optician) => {
      if (!optician.latitude || !optician.longitude) return { id: optician.id, routeInfo: null };
      
      try {
        const routeInfo = await fetchRoute(userLat, userLng, optician.latitude, optician.longitude);
        return { id: optician.id, routeInfo };
      } catch (error) {
        console.error(`Error fetching route for ${optician.businessName}:`, error);
        return { id: optician.id, routeInfo: null };
      }
    });

    const results = await Promise.all(routePromises);
    
    setOpticians(prev => prev.map(opt => {
      const result = results.find(r => r.id === opt.id);
      if (result?.routeInfo) {
        return { ...opt, routeInfo: result.routeInfo };
      }
      return opt;
    }));
    
    setRoutesLoading(false);
  };

  const fetchRoute = async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<RouteInfo | null> => {
    try {
      // OSRM for driving route
      const drivingUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
      const drivingRes = await fetch(drivingUrl);
      const drivingData = await drivingRes.json();
      
      if (drivingData.code !== 'Ok' || !drivingData.routes?.[0]) {
        return null;
      }

      const route = drivingData.routes[0];
      const drivingDistance = route.distance / 1000; // meters to km
      const drivingTime = route.duration / 60; // seconds to minutes
      
      // OSRM for walking route
      const walkingUrl = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
      const walkingRes = await fetch(walkingUrl);
      const walkingData = await walkingRes.json();
      
      let walkingTime = drivingTime * 3; // Fallback: assume walking is 3x driving
      
      if (walkingData.code === 'Ok' && walkingData.routes?.[0]) {
        walkingTime = walkingData.routes[0].duration / 60;
      }

      return {
        drivingDistance,
        drivingTime,
        walkingTime
      };
    } catch (error) {
      console.error('Route fetch error:', error);
      return null;
    }
  };

  const searchByCity = async () => {
    if (!citySearch.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`/api/opticians/nearest?city=${encodeURIComponent(citySearch)}&limit=100`);
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
    setTimeout(() => {
      searchByCityName(city);
    }, 100);
  };

  const searchByCityName = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opticians/nearest?city=${encodeURIComponent(city)}&limit=100`);
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

  const getGoogleMapsUrl = (optician: Optician, withDirections: boolean = false) => {
    if (withDirections && latitude && longitude) {
      // Directions from user location to optician
      if (optician.latitude && optician.longitude) {
        return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${optician.latitude},${optician.longitude}`;
      } else {
        const address = encodeURIComponent(`${optician.address}, ${optician.postalCode} ${optician.city}, Morocco`);
        return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${address}`;
      }
    } else {
      // Just show optician location
      if (optician.latitude && optician.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${optician.latitude},${optician.longitude}`;
      } else {
        const address = encodeURIComponent(`${optician.address}, ${optician.postalCode} ${optician.city}, Morocco`);
        return `https://www.google.com/maps/search/?api=1&query=${address}`;
      }
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
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

          {geoError && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                {permission === 'denied' 
                  ? '🔒 ' + (t.locationDenied || 'Accès à la localisation refusé')
                  : '⚠️ ' + geoError
                }
              </p>
              {permission === 'denied' && (
                <div className="text-xs text-yellow-700 mb-3 space-y-1">
                  <p>📱 <strong>Sur mobile:</strong> Paramètres → Autorisations → Localisation → Autoriser</p>
                  <p>💻 <strong>Sur ordinateur:</strong> Cliquez sur l&apos;icône 🔒 dans la barre d&apos;adresse → Autoriser la localisation</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestLocation}
                  className="flex items-center"
                >
                  <Navigation className="mr-2 h-3 w-3" />
                  Réessayer
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleShowCitySearch}
                >
                  <Search className="mr-2 h-3 w-3" />
                  {t.searchByCity || 'Rechercher par ville'}
                </Button>
              </div>
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
          {/* View Toggle and Filters */}
          <div className="mb-4 space-y-4">
            <div className="flex flex-wrap gap-2">
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

            {latitude && longitude && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t.searchRadius || 'Rayon de recherche'}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {searchRadius} {t.kmAway || 'km'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant={sortBy === 'distance' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('distance')}
                  >
                    {t.sortByDistance || 'Trier par distance'}
                  </Button>
                  <Button
                    variant={sortBy === 'city' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('city')}
                  >
                    {t.sortByCity || 'Trier par ville'}
                  </Button>
                  <Button
                    variant={groupByCityEnabled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setGroupByCityEnabled(!groupByCityEnabled)}
                  >
                    {t.groupByCity || 'Grouper par ville'}
                  </Button>
                </div>

                <div className="text-xs text-gray-600 pt-2">
                  {filteredOpticians.length} {filteredOpticians.length === 1 ? 'opticien trouvé' : 'opticiens trouvés'}
                  {filteredOpticians.length > 0 && filteredOpticians[0].distance !== undefined && (
                    <> • {t.closestOptician || 'Le plus proche'}: {formatDistance(filteredOpticians[0].distance)}</>
                  )}
                </div>
              </div>
            )}
          </div>

          {viewMode === 'map' ? (
            <div className="mb-4">
              <MapComponent 
                opticians={sortedOpticians} 
                userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {routesLoading && latitude && longitude && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calcul des itinéraires en cours...
                </div>
              )}
              
              {groupedOpticians ? (
                groupedOpticians.cities.map((city) => {
                  const cityOpticians = groupedOpticians.groups.get(city) || [];
                  return (
                    <div key={city} className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        {city}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({cityOpticians.length})
                        </span>
                      </h3>
                      {cityOpticians.map((optician) => renderOpticianCard(optician))}
                    </div>
                  );
                })
              ) : (
                sortedOpticians.map((optician) => renderOpticianCard(optician))
              )}
            </div>
          )}
        </>
      )}

      {!loading && opticians.length === 0 && (latitude || citySearch) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {t.noOpticianFound || 'Aucun opticien trouvé dans cette zone.'}
          </p>
        </div>
      )}
    </div>
  );

  function renderOpticianCard(optician: Optician) {
    return (
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
                {formatDistance(optician.distance)}
              </span>
            </div>
          )}
        </div>

        {/* Route Information Card */}
        {optician.routeInfo && latitude && longitude && (
          <div className="mb-3 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">En voiture</p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatTime(optician.routeInfo.drivingTime)} • {optician.routeInfo.drivingDistance.toFixed(1)} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">À pied</p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatTime(optician.routeInfo.walkingTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {optician.address && (
          <div className="flex items-start mb-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <div>
              <div>{optician.address}</div>
              <div>{optician.postalCode} {optician.city}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <a href={`tel:${optician.phone}`}>
            <Button variant="primary" size="sm" className="w-full flex items-center justify-center">
              <Phone className="mr-2 h-4 w-4" />
              {t.call || 'Appeler'}
            </Button>
          </a>
          {optician.whatsapp && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full flex items-center justify-center"
              onClick={() => handleWhatsAppClick(optician.whatsapp!)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          )}
        </div>

        {/* Google Maps Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={getGoogleMapsUrl(optician, false)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="w-full flex items-center justify-center text-xs">
              <MapPin className="mr-1 h-3 w-3" />
              Voir sur Maps
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </a>
          <a
            href={getGoogleMapsUrl(optician, true)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="w-full flex items-center justify-center text-xs">
              <Navigation className="mr-1 h-3 w-3" />
              Itinéraire
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    );
  }
}