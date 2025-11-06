'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  reference: string;
  material: string;
  gender: string;
  color: string;
  price: number;
  images: string[];
  inStock: boolean;
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    material: '',
    gender: '',
    color: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = !filters.material || product.material === filters.material;
    const matchesGender = !filters.gender || product.gender === filters.gender;
    const matchesColor = !filters.color || product.color === filters.color;

    return matchesSearch && matchesMaterial && matchesGender && matchesColor;
  });

  return (
    <div className="min-h-screen bg-palladian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-abyssal mb-8">Catalogue de Montures</h1>

        {/* Search and Filters */}
        <div className="bg-white p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une monture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
                />
              </div>
            </div>

            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            >
              <option value="">Tous les matériaux</option>
              <option value="Métal">Métal</option>
              <option value="Plastique">Plastique</option>
              <option value="Titane">Titane</option>
              <option value="Acétate">Acétate</option>
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-fantastic"
            >
              <option value="">Tous les genres</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Unisexe">Unisexe</option>
              <option value="Enfant">Enfant</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
            <p className="mt-4 text-gray-600">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-lg">
            <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/catalogue/${product.id}`}>
                <div className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pas d&apos;image
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                        RUPTURE
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-abyssal mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Réf: {product.reference}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {product.material} • {product.gender}
                      </div>
                      <div className="text-sm text-gray-400">
                        Prix sur demande
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-fantastic text-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Accédez aux prix professionnels</h2>
          <p className="mb-6">
            Inscrivez-vous en tant qu&apos;opticien pour voir les prix et passer commande directement.
          </p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
