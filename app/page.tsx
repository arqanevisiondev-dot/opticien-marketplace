import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Eye, MapPin, ShoppingBag, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-fantastic to-abyssal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Votre Marketplace de Montures de Lunettes
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Connectez-vous avec les meilleurs fournisseurs de montures
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalogue">
                <Button variant="secondary" size="lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Découvrir le Catalogue
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-abyssal">
                  <Users className="mr-2 h-5 w-5" />
                  Devenir Partenaire
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
            Pourquoi Choisir OptiMarket ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">Large Catalogue</h3>
              <p className="text-gray-600">
                Accédez à des milliers de montures de qualité provenant de fournisseurs agréés.
              </p>
            </div>

            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">Géolocalisation</h3>
              <p className="text-gray-600">
                Trouvez facilement les opticiens les plus proches de chez vous sur notre carte interactive.
              </p>
            </div>

            <div className="bg-white p-8 shadow-lg">
              <div className="bg-burning-flame w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-abyssal">Réseau Professionnel</h3>
              <p className="text-gray-600">
                Rejoignez une communauté d&apos;opticiens professionnels et bénéficiez d&apos;offres exclusives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-fantastic text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Inscrivez-vous dès maintenant et accédez à notre catalogue complet avec les prix professionnels.
          </p>
          <Link href="/auth/signup">
            <Button variant="secondary" size="lg">
              Créer un Compte Gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
