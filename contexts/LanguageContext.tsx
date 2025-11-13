'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always initialize with 'fr' to match server-side rendering
  const [language, setLanguageState] = useState<Language>('fr');
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage after hydration
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setIsHydrated(true);
  }, []);

  // Appliquer la direction au montage et aux changements
  useEffect(() => {
    if (!isHydrated) return;
    
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isHydrated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Appliquer la direction RTL pour l'arabe
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
