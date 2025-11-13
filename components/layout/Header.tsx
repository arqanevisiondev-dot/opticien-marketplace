'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { User, Menu, X, LogOut, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navigation = [
    { name: t.home, href: '/' },
    { name: t.catalog, href: '/catalogue' },
    { name: t.opticians, href: '/opticiens' },
    { name: t.contact, href: '/contact' },
  ];

  return (
    <header className="bg-abyssal text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo-arqane-vision.png" 
              alt="Arqane Vision" 
              width={180} 
              height={50}
              className="h-12 w-auto"
            />
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
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-white/30 rounded hover:bg-white/10 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'fr' ? 'Français' : language === 'en' ? 'English' : 'العربية'}
                </span>
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setLanguage('fr');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === 'fr' ? 'bg-gray-50 text-blue-fantastic font-medium' : 'text-gray-700'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === 'en' ? 'bg-gray-50 text-blue-fantastic font-medium' : 'text-gray-700'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === 'ar' ? 'bg-gray-50 text-blue-fantastic font-medium' : 'text-gray-700'
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {status === 'loading' ? (
              <div className="text-sm text-gray-300">{t.loading}...</div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">
                  {session.user?.email}
                </span>
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white text-white hover:bg-white hover:text-abyssal flex items-center "
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2 " />
                  {t.logout}
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-abyssal flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {t.login}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary" size="sm">
                    {t.signup}
                  </Button>
                </Link>
              </>
            )}
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
