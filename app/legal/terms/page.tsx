"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-abyssal mb-8">{t.termsTitle}</h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection1Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection1Para1}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection2Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection2Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection2Para2}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection3Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection3Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection3Para2}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>{t.termsSection3List1}</li>
                <li>{t.termsSection3List2}</li>
                <li>{t.termsSection3List3}</li>
                <li>{t.termsSection3List4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection4Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection4Para1}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>{t.termsSection4List1}</li>
                <li>{t.termsSection4List2}</li>
                <li>{t.termsSection4List3}</li>
                <li>{t.termsSection4List4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection5Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection5Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection5Para2}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection6Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection6Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection6Para2}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection7Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection7Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection7Para2}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection8Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection8Para1}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection9Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection9Para1}</p>
              <p className="text-gray-700 mb-4">{t.termsSection9Para2}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection10Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection10Para1}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">{t.termsSection11Title}</h2>
              <p className="text-gray-700 mb-4">{t.termsSection11Para1}</p>
              <ul className="list-none text-gray-700 mb-4">
                <li className="mb-2"><strong>{t.termsContactEmailLabel}</strong> {t.termsContactEmail}</li>
                <li className="mb-2"><strong>{t.termsContactPhoneLabel}</strong> {t.termsContactPhone}</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">{t.termsLastUpdated}</p>
            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-fantastic hover:text-burning-flame">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
