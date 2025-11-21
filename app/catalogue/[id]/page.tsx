'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, MessageCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';

// Dynamically import nearest optician finder
const NearestOpticianFinder = dynamic(() => import('@/components/opticians/NearestOpticianFinder'), {
  ssr: false,
});

interface Product {
  id: string;
  name: string;
  slug: string;
  reference: string;
  description: string;
  material: string;
  gender: string;
  shape: string;
  color: string;
  price: number;
  salePrice?: number;
  images: string[];
  inStock: boolean;
  supplier: {
    name: string;
    phone: string;
    whatsapp: string;
    address?: string;
    city?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const { add, isInCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const scrollToSupplier = () => {
    const supplierSection = document.getElementById('supplier-section');
    if (supplierSection) {
      supplierSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canSeePrices = 
    (session?.user?.role === 'OPTICIAN' && session?.user?.opticianStatus === 'APPROVED') || 
    session?.user?.role === 'ADMIN';
  const isOptician = session?.user?.role === 'OPTICIAN';

  // Debug: afficher les informations de session
  console.log('Session:', {
    role: session?.user?.role,
    opticianStatus: session?.user?.opticianStatus,
    canSeePrices
  });

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`);
      if (!res.ok) {
        router.push('/catalogue');
        return;
      }
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/catalogue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-palladian flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-fantastic"></div>
          <p className="mt-4 text-gray-600">{t.loading}...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-palladian py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/catalogue">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToCatalog}
          </Button>
        </Link>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-200 mb-4 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {t.noProducts}
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-200 overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-fantastic' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-abyssal mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{t.reference}: {product.reference}</p>

              {!product.inStock && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 mb-4">
                  {t.outOfStock}
                </div>
              )}

              {/* Price */}
              <div className="bg-palladian p-6 mb-6">
                <div className="text-sm text-gray-600 mb-1">{t.priceOnRequest}</div>
                {canSeePrices ? (
                  product.salePrice ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-gray-500 line-through">
                        {product.price.toFixed(2)} DH
                      </span>
                      <span className="text-gray-500">/</span>
                      <span className="text-3xl font-bold text-burning-flame">
                        {product.salePrice.toFixed(2)} DH
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-burning-flame">
                      {product.price.toFixed(2)} DH
                    </div>
                  )
                ) : (
                  <button
                    onClick={scrollToSupplier}
                    className="text-base text-blue-fantastic hover:text-blue-600 underline cursor-pointer text-left"
                  >
                    {t.contactForPrice}
                  </button>
                )}
              </div>
              {isOptician && (
                <div className="mt-4">
                  <Button
                    variant={isInCart(product.id) ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => {
                      if (!isInCart(product.id)) {
                        const url = `/catalogue/${product.slug || product.id}`;
                        add({ id: product.id, name: product.name, reference: product.reference, url });
                      }
                    }}
                  >
                    {isInCart(product.id) ? 'Dans le panier' : 'Ajouter au panier'}
                  </Button>
                </div>
              )}
              {/* Specifications */}
              <div className="space-y-3 mb-6">
                <h2 className="text-xl font-bold text-abyssal">{t.description}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">{t.material}:</span>
                    <span className="ml-2 font-medium">{product.material}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.gender}:</span>
                    <span className="ml-2 font-medium">{product.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.shape}:</span>
                    <span className="ml-2 font-medium">{product.shape}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.color}:</span>
                    <span className="ml-2 font-medium">{product.color}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-abyssal mb-2">{t.description}</h2>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {/* Supplier Info */}
              <div id="supplier-section" className="border-t pt-6">
                <h2 className="text-xl font-bold text-abyssal mb-4">{t.contactSupplier}</h2>
                <p className="text-lg font-medium mb-4">{product.supplier.name}</p>
                
                {/* Address */}
                {product.supplier.address && (
                  <div className="flex items-start mb-4 text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                    <div>
                      <div>{product.supplier.address}</div>
                      <div>{product.supplier.postalCode} {product.supplier.city}</div>
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="flex gap-3 mb-6">
                  <a href={`tel:${product.supplier.phone}`}>
                    <Button variant="primary" className='flex items-center'>
                      <Phone className="h-4 w-4 mr-2" />
                      {t.call}
                    </Button>
                  </a>
                  {product.supplier.whatsapp && (
                    <a
                      href={`https://wa.me/${product.supplier.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" className='flex items-center'>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t.whatsapp}
                      </Button>
                    </a>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Nearest Optician Finder */}
        <NearestOpticianFinder productName={product.name} />
      </div>
    </div>
  );
}
