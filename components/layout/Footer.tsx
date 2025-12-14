"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()
  const [siteSettings, setSiteSettings] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setSiteSettings(data)
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])
  return (
    <footer className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#f56a24]">Arqane Vision</h3>
            <p className="text-sm text-gray-300">{t.platformDescription}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#f56a24]">{t.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalogue" className="text-gray-300 hover:text-[#f56a24] transition-colors">
                  {t.catalog}
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-gray-300 hover:text-[#f56a24] transition-colors">
                  {t.becomePartnerLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#f56a24]">{t.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-[#f56a24] transition-colors">
                  {t.termsConditions}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-[#f56a24] transition-colors">
                  {t.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#f56a24] transition-colors">
                  {t.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#f56a24]">{t.contact}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2 hover:text-[#f56a24] transition-colors">
                <Mail className="h-4 w-4" />
                <span>{siteSettings?.contact_email}</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-[#f56a24] transition-colors">
                <Phone className="h-4 w-4" />
                <span>{siteSettings?.contact_phone}</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{siteSettings?.contact_address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Arqane Vision. {t.allRightsReserved}.
          </p>
        </div>
      </div>
    </footer>
  )
}
