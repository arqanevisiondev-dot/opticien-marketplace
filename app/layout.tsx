import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionProvider from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import CartBar from '@/components/cart/CartBar';
import { headers } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arqane Vision - Marketplace de Montures de Lunettes",
  description: "Plateforme de marché pour montures de lunettes à destination des opticiens professionnels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect preferred language from the request Accept-Language header (safe access)
  const _hdrs = headers()
  let acceptLang = ''
  try {
    // headers() may return a Headers-like object with a get() method
    if (typeof (_hdrs as any).get === 'function') {
      acceptLang = ( _hdrs as any).get('accept-language') || ''
    } else if (typeof _hdrs === 'object' && _hdrs) {
      // Fall back to plain-object access if present
      acceptLang = ( _hdrs as any)['accept-language'] || ( _hdrs as any)['Accept-Language'] || ''
    }
  } catch (e) {
    acceptLang = ''
  }
  const pickLang = (al: string) => {
    const supported = ['fr', 'en', 'ar'] as const
    const parts = al.split(',').map(p => p.split(';')[0].trim().toLowerCase())
    for (const p of parts) {
      // match exact or prefix (e.g. fr-FR -> fr)
      const code = p.split('-')[0]
      if (supported.includes(code as any)) return code as typeof supported[number]
    }
    return 'fr' as const
  }
  const initialLanguage = pickLang(acceptLang)
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartBar />
            </CartProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
