'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/OpticianMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse flex items-center justify-center">Chargement de la carte...</div>
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

export default function OpticiensPage() {
  const [opticians, setOpticians] = useState<Optician[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    fetchOpticians();
  }, []);

  const fetchOpticians = async () => {
    try {
      const res = await fetch('/api/opticians');
      const data = await res.json();
      setOpticians(data);
    } catch (error) {
      console.error('Error fetching opticians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-abyssal mb-4">Trouver un Opticien</h1>
          <p className="text-gray-600">
            Localisez les opticiens partenaires près de chez vous
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Vue Carte
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            Vue Liste
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
            <p className="mt-4 text-gray-600">Chargement des opticiens...</p>
          </div>
        ) : (
          <>
            {viewMode === 'map' ? (
              <div className="bg-white shadow-lg p-4">
                <MapComponent opticians={opticians} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opticians.map((optician) => (
                  <div key={optician.id} className="bg-white p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-abyssal mb-2">
                      {optician.businessName}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {optician.firstName} {optician.lastName}
                    </p>
                    
                    {optician.address && (
                      <div className="flex items-start mb-3 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{optician.address}</div>
                          <div>{optician.postalCode} {optician.city}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handlePhoneClick(optician.phone)}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {optician.phone}
                      </Button>
                      
                      {optician.whatsapp && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
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

            {opticians.length === 0 && (
              <div className="text-center py-12 bg-white shadow-lg">
                <p className="text-gray-600 text-lg">Aucun opticien trouvé</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
