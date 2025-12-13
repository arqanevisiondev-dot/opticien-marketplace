'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function GeocodeOpticiansPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGeocodeAll = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/opticians/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error geocoding:', error);
      setResult({ error: 'Failed to geocode opticians' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Géocodage des Opticiens
          </h1>
          <p className="text-gray-600 mb-8">
            Convertir les adresses des opticiens en coordonnées GPS pour affichage sur la carte
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              📍 À propos du géocodage
            </h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ Trouve automatiquement les coordonnées GPS à partir des adresses</li>
              <li>✅ Utilise OpenStreetMap (service gratuit)</li>
              <li>✅ Permet l'affichage sur la carte</li>
              <li>✅ Calcul automatique des distances</li>
              <li>⚠️ Prend environ 1 seconde par opticien</li>
            </ul>
          </div>

          {!result && (
            <Button
              onClick={handleGeocodeAll}
              disabled={loading}
              variant="primary"
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Géocodage en cours...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-5 w-5" />
                  Géocoder tous les opticiens sans coordonnées
                </>
              )}
            </Button>
          )}

          {result && !result.error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Géocodage terminé avec succès !
                  </h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>
                      <strong>Total traité :</strong> {result.total} opticiens
                    </p>
                    <p>
                      <strong className="text-green-700">✅ Réussis :</strong> {result.success}
                    </p>
                    <p>
                      <strong className="text-red-700">❌ Échecs :</strong> {result.failed}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="mt-4"
              >
                Rafraîchir
              </Button>
            </div>
          )}

          {result?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <XCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Erreur
                  </h3>
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              </div>
              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Les nouveaux opticiens qui s'inscrivent seront automatiquement géocodés.
              Cet outil est uniquement pour les opticiens existants sans coordonnées GPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
