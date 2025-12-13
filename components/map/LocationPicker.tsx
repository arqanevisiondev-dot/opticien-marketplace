'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LocationPickerProps {
  address?: string;
  city?: string;
  postalCode?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  address,
  city,
  postalCode,
  onLocationSelect,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [geocodeStatus, setGeocodeStatus] = useState<string>('');

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet (client-side only)
      const L = (await import('leaflet')).default;
      // CSS import may not have typings in the project; ignore TS for this dynamic import
      // @ts-ignore
      await import('leaflet/dist/leaflet.css');

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Default to Morocco center
      const defaultLat = initialLat || 33.5731;
      const defaultLng = initialLng || -7.5898;

      // capture ref locally because after await the ref may be null from TS POV
      const container = mapRef.current as HTMLDivElement;
      const mapInstance = L.map(container).setView([defaultLat, defaultLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance);

      // Create draggable marker
      const markerInstance = L.marker([defaultLat, defaultLng], {
        draggable: true,
      }).addTo(mapInstance);

      // Update coordinates when marker is dragged
      markerInstance.on('dragend', function () {
        const position = markerInstance.getLatLng();
        setCoordinates({ lat: position.lat, lng: position.lng });
        onLocationSelect(position.lat, position.lng);
      });

      // Allow clicking on map to move marker
      mapInstance.on('click', function (e: any) {
        markerInstance.setLatLng(e.latlng);
        setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      if (initialLat && initialLng) {
        setCoordinates({ lat: initialLat, lng: initialLng });
      }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Auto-geocode when address changes
  const handleGeocode = async () => {
    if (!address && !city) {
      setGeocodeStatus('Veuillez entrer une adresse ou une ville');
      return;
    }

    setLoading(true);
    setGeocodeStatus('Recherche...');

    try {
      // Try with full address
      let query = [address, postalCode, city, 'Morocco'].filter(Boolean).join(', ');
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: { 'User-Agent': 'OpticienMarketplace/1.0' },
        }
      );

      let data = await response.json();

      // Fallback to city only if no results
      if (!data || data.length === 0) {
        if (city) {
          query = `${city}, Morocco`;
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
              headers: { 'User-Agent': 'OpticienMarketplace/1.0' },
            }
          );
          data = await response.json();
          setGeocodeStatus('📍 Position approximative (ville) - ajustez le marqueur');
        }
      } else {
        setGeocodeStatus('✅ Position trouvée - vérifiez et ajustez si nécessaire');
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (map && marker) {
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
          setCoordinates({ lat, lng });
          onLocationSelect(lat, lng);
        }
      } else {
        setGeocodeStatus('❌ Adresse non trouvée - placez le marqueur manuellement');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodeStatus('❌ Erreur de recherche - placez le marqueur manuellement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 Localisation sur la carte
          </label>
          <p className="text-xs text-gray-600">
            Cliquez sur "Rechercher" pour localiser automatiquement, puis ajustez le marqueur en le déplaçant.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleGeocode}
          disabled={loading || (!address && !city)}
          className="flex items-center gap-2"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Rechercher
        </Button>
      </div>

      {geocodeStatus && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            geocodeStatus.includes('✅')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : geocodeStatus.includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {geocodeStatus}
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg border-2 border-gray-300 relative"
      >
        <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-fantastic" />
            <span className="font-medium">Déplacez le marqueur</span>
          </div>
        </div>
      </div>

      {coordinates && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Coordonnées sélectionnées:</span>
            <div className="font-mono text-xs mt-1">
              Latitude: {coordinates.lat.toFixed(7)} | Longitude: {coordinates.lng.toFixed(7)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          💡 <strong>Astuce:</strong> Vous pouvez déplacer le marqueur 🗺️ en le faisant glisser ou en cliquant
          n'importe où sur la carte pour le repositionner.
        </p>
      </div>
    </div>
  );
}
