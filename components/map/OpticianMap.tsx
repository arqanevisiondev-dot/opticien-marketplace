'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Phone, MessageCircle, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatDistance } from '@/lib/geolocation';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with distance label
const createCustomIcon = (distance?: number, isNearest?: boolean) => {
  const color = isNearest ? '#3b82f6' : '#ef4444';
  const label = distance !== undefined ? formatDistance(distance) : '';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0zm0 17.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
        </svg>
        ${label ? `<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${label}</div>` : ''}
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

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

interface OpticianMapProps {
  opticians: Optician[];
  userLocation?: { lat: number; lng: number };
}

// Component to fit bounds automatically with safety checks
function AutoFitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for map to be fully initialized
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || coordinates.length === 0) return;

    try {
      // Check if map is still mounted and valid
      if (!map || !map.getContainer()) return;

      if (coordinates.length === 1) {
        map.setView(coordinates[0], 13, { animate: false });
        return;
      }

      const bounds = L.latLngBounds(coordinates);
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        try {
          if (map && map.getContainer()) {
            map.fitBounds(bounds, { 
              padding: [50, 50], 
              maxZoom: 15,
              animate: false // Disable animation to prevent timing issues
            });
          }
        } catch (err) {
          console.warn('Error fitting bounds:', err);
        }
      });
    } catch (err) {
      console.warn('Error in AutoFitBounds:', err);
    }
  }, [coordinates, map, isReady]);

  return null;
}

export default function OpticianMap({ opticians, userLocation }: OpticianMapProps) {
  const [mapKey, setMapKey] = useState(0);

  // Filter opticians with valid coordinates
  const opticiansWithCoords = useMemo(() => 
    opticians.filter((o) => o.latitude && o.longitude),
    [opticians]
  );

  // Find nearest optician
  const nearestOptician = useMemo(() => {
    if (!userLocation) return null;
    return opticiansWithCoords.reduce((nearest, current) => {
      if (!current.distance && !nearest.distance) return nearest;
      if (!current.distance) return nearest;
      if (!nearest.distance) return current;
      return current.distance < nearest.distance ? current : nearest;
    }, opticiansWithCoords[0]);
  }, [opticiansWithCoords, userLocation]);

  // Default center (Rabat, Morocco)
  const defaultCenter: [number, number] = [33.9716, -6.8498];
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : opticiansWithCoords.length > 0
    ? [opticiansWithCoords[0].latitude!, opticiansWithCoords[0].longitude!]
    : defaultCenter;

  // Collect all coordinates for auto-fit
  const allCoordinates: [number, number][] = useMemo(() => [
    ...(userLocation ? [[userLocation.lat, userLocation.lng] as [number, number]] : []),
    ...opticiansWithCoords.map(o => [o.latitude!, o.longitude!] as [number, number]),
  ], [userLocation, opticiansWithCoords]);

  const handleGetDirections = (lat: number, lng: number) => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`,
        '_blank'
      );
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  // Force remount when coordinates change significantly
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [opticiansWithCoords.length, userLocation?.lat, userLocation?.lng]);

  if (opticiansWithCoords.length === 0 && !userLocation) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Aucune position disponible pour afficher la carte</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <AutoFitBounds coordinates={allCoordinates} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #3b82f6;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="p-2 text-center">
                <p className="font-bold">Votre position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Optician markers */}
        {opticiansWithCoords.map((optician) => {
          const isNearest = nearestOptician?.id === optician.id;
          
          return (
            <Marker
              key={optician.id}
              position={[optician.latitude!, optician.longitude!]}
              icon={createCustomIcon(optician.distance, isNearest)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1">
                    {optician.businessName}
                    {isNearest && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Plus proche
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {optician.firstName} {optician.lastName}
                  </p>
                  {optician.distance !== undefined && (
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      À {formatDistance(optician.distance)}
                    </p>
                  )}
                  {optician.address && (
                    <p className="text-sm mb-2">
                      {optician.address}<br />
                      {optician.postalCode} {optician.city}
                    </p>
                  )}
                  <div className="space-y-2">
                    <a
                      href={`tel:${optician.phone}`}
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {optician.phone}
                    </a>
                    {optician.whatsapp && (
                      <a
                        href={`https://wa.me/${optician.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-green-600 hover:underline"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => handleGetDirections(optician.latitude!, optician.longitude!)}
                      className="flex items-center text-sm text-purple-600 hover:underline w-full"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Obtenir l'itinéraire
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}