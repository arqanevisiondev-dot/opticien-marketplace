'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Phone, MessageCircle } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
}

interface OpticianMapProps {
  opticians: Optician[];
}

export default function OpticianMap({ opticians }: OpticianMapProps) {
  // Filter opticians with valid coordinates
  const opticiansWithCoords = opticians.filter(
    (o) => o.latitude && o.longitude
  );

  // Default center (Paris, France)
  const defaultCenter: [number, number] = [48.8566, 2.3522];
  const center: [number, number] = opticiansWithCoords.length > 0
    ? [opticiansWithCoords[0].latitude!, opticiansWithCoords[0].longitude!]
    : defaultCenter;

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {opticiansWithCoords.map((optician) => (
          <Marker
            key={optician.id}
            position={[optician.latitude!, optician.longitude!]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{optician.businessName}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {optician.firstName} {optician.lastName}
                </p>
                {optician.address && (
                  <p className="text-sm mb-2">
                    {optician.address}<br />
                    {optician.postalCode} {optician.city}
                  </p>
                )}
                <div className="space-y-1">
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
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
