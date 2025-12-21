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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect preferred language from the request Accept-Language header
  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') || ''

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
    <html lang={initialLanguage} suppressHydrationWarning>
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
