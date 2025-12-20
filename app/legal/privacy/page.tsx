"use client"

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-[#f56a24]">{t.privacyTitle ?? 'Privacy Policy'}</h1>
      <p className="mt-4 text-gray-700">{t.privacyIntro ?? 'This Privacy Policy explains how we collect, use, and protect your personal information.'}</p>

      <section className="mt-6 text-sm text-gray-600">
        <h2 className="font-semibold">{t.infoWeCollectTitle ?? 'Information We Collect'}</h2>
        <p className="mt-2">{t.infoWeCollectText ?? 'Examples: account data, order history, analytics.'}</p>

        <h2 className="font-semibold mt-4">{t.howWeUseTitle ?? 'How We Use Information'}</h2>
        <p className="mt-2">{t.howWeUseText ?? 'Examples: to provide services, improve the product.'}</p>

        <h2 className="font-semibold mt-4">{t.contactTitle ?? 'Contact'}</h2>
        <p className="mt-2">{t.contactText ?? 'For privacy concerns, contact us via the site contact page.'}</p>
      </section>
    </main>
  )
}
