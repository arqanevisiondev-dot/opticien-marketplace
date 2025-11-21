'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, MapPin, ShoppingBag, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show modal to non-authenticated users
    if (status === 'loading') return;
    
    if (!session) {
      // Show modal after a brief delay to let page content render
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [session, status]);

  const handleYes = () => {
    setShowModal(false);
    router.push('/auth/signup');
  };

  const handleNo = () => {
    setShowModal(false);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-fantastic to-abyssal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogue">
              <Button variant="secondary" size="lg" className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t.discoverCatalog}
              </Button>
            </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="flex items-center border-white text-white hover:bg-white hover:text-abyssal">
                  <Users className="mr-2 h-5 w-5" />
                  {t.becomePartner}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-palladian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-abyssal">
            {t.features}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">{t.exclusiveCatalog}</h3>
              <p className="text-gray-600">
                {t.exclusiveCatalogDesc}
              </p>
            </div>

            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">{t.fastDelivery}</h3>
              <p className="text-gray-600">
                {t.fastDeliveryDesc}
              </p>
            </div>

            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">{t.professionalPrices}</h3>
              <p className="text-gray-600">
                {t.professionalPricesDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-fantastic text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t.ctaTitle}
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            {t.ctaSubtitle}
          </p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg" >
              {t.createFreeAccount}
            </Button>
          </Link>
        </div>
      </section>

      {/* Optician Prompt Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 shadow-2xl rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold text-abyssal mb-4">
              {t.opticianPromptTitle}
            </h2>
            <div className="flex gap-4">
              <Button
                onClick={handleYes}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {t.yes}
              </Button>
              <Button
                onClick={handleNo}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {t.no}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
