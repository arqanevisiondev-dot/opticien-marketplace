// components/map/LocationPicker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, X } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (data: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    postalCode: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialCity?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLat = 33.9716, 
  initialLng = -6.8498,
  initialCity = ''
}: LocationPickerProps) {
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });
  const [locationData, setLocationData] = useState({
    address: '',
    city: initialCity,
    postalCode: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }

    initializeMap();
  };

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const marker = L.marker([coordinates.lat, coordinates.lng], {
      draggable: true,
      icon: customIcon
    }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      await updateLocation(pos.lat, pos.lng);
    });

    map.on('click', async (e: any) => {
      marker.setLatLng(e.latlng);
      await updateLocation(e.latlng.lat, e.latlng.lng);
    });

    // Initial reverse geocode
    reverseGeocode(coordinates.lat, coordinates.lng);
  };

  const updateLocation = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'OpticienMarketplace/1.0' } }
      );
      const data = await response.json();
      
      if (data.address) {
        // Extract clean address components
        const street = data.address.road || 
                      data.address.neighbourhood || 
                      data.address.suburb ||
                      data.address.hamlet || '';
        
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village ||
                    data.address.county || '';
        
        const postalCode = data.address.postcode || '';
        
        const fullAddress = [street, data.address.suburb]
          .filter(Boolean)
          .join(', ');
        
        const locationInfo = {
          address: fullAddress || data.display_name.split(',')[0],
          city: city,
          postalCode: postalCode
        };
        
        setLocationData(locationInfo);
        
        // Send complete data to parent
        onLocationSelect({
          lat,
          lng,
          address: locationInfo.address,
          city: locationInfo.city,
          postalCode: locationInfo.postalCode
        });
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Enhance search with Morocco context
      const query = searchQuery.includes('Morocco') 
        ? searchQuery 
        : `${searchQuery}, Morocco`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ma&addressdetails=1`,
        { headers: { 'User-Agent': 'OpticienMarketplace/1.0' } }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setCoordinates({ lat, lng });
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        
        await reverseGeocode(lat, lng);
      } else {
        setError('Adresse non trouvée. Cliquez sur la carte pour pointer votre emplacement exact.');
      }
    } catch (err) {
      setError('Erreur de recherche. Essayez de cliquer sur la carte.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCoordinates({ lat, lng });
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }
          
          await reverseGeocode(lat, lng);
          setIsLoading(false);
        },
        () => {
          setError('Géolocalisation refusée. Recherchez ou cliquez sur la carte.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Géolocalisation non supportée. Recherchez ou cliquez sur la carte.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="Ex: Avenue Mohammed V, Quartier Hassan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={searchLocation}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Chercher
        </button>
      </div>

      {/* GPS Button */}
      <button
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        <Navigation className="w-4 h-4" />
        📍 Ma position actuelle (GPS)
      </button>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Map */}
      <div 
        ref={mapRef}
        className="w-full h-[400px] rounded-lg border-2 border-gray-300 bg-gray-100"
      />

      {/* Location Info */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-700">
              📍 Position: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
            {locationData.address && (
              <p className="text-sm text-gray-600">
                🏠 Adresse: {locationData.address}
              </p>
            )}
            {locationData.city && (
              <p className="text-sm text-gray-600">
                🏙️ Ville: {locationData.city}
              </p>
            )}
            {locationData.postalCode && (
              <p className="text-sm text-gray-600">
                📮 Code Postal: {locationData.postalCode}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Déplacez le marqueur ou cliquez sur la carte pour ajuster votre position exacte
        </p>
      </div>
    </div>
  );
}