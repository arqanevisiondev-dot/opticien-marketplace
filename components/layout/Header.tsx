'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Catalogue', href: '/catalogue' },
    { name: 'Opticiens', href: '/opticiens' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-abyssal text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-burning-flame" />
            <span className="text-xl font-bold">OptiMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-burning-flame ${
                  pathname === item.href ? 'text-burning-flame' : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-1 text-sm border border-white/30 hover:bg-white/10 transition-colors"
            >
              {language === 'fr' ? 'FR' : 'AR'}
            </button>

            {/* Auth Buttons */}
            <Link href="/auth/signin">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-abyssal">
                <User className="h-4 w-4 mr-2" />
                Connexion
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" size="sm">
                S'inscrire
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium hover:bg-white/10 ${
                  pathname === item.href ? 'text-burning-flame' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link href="/auth/signin" className="block">
                <Button variant="outline" size="sm" className="w-full border-white text-white">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/signup" className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
