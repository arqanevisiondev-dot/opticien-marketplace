"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { User, Menu, X, LogOut, Globe } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { language, setLanguage, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const navigation = [
    { name: t.home, href: "/" },
    { name: t.allProducts || "Tous les produits", href: "/products" },
    { name: t.catalog, href: "/catalogue" },
    { name: t.contact, href: "/contact" },
  ];

  return (
    <header className="bg-gradient-to-r from-[#1B2632] to-[#2C3B4D] text-white sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-arqane-vision.png" alt="Arqane Vision" width={180} height={50} className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href ? "text-[#f56a24]" : "text-white hover:text-[#f56a24]"
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
                  {language === "fr" ? "Français" : language === "en" ? "English" : "العربية"}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setLanguage("fr")
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === "fr" ? "bg-gray-50 text-[#f56a24] font-medium" : "text-gray-800"
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en")
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === "en" ? "bg-gray-50 text-[#f56a24] font-medium" : "text-gray-800"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("ar")
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      language === "ar" ? "bg-gray-50 text-[#f56a24] font-medium" : "text-gray-800"
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {status === "loading" ? (
              <div className="text-sm text-gray-300">{t.loading}...</div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{session.user?.email}</span>
                {session.user?.role === "OPTICIAN" && (
                  <Link href="/profile">
                    <Button variant="secondary" size="sm">
                      {t.myProfile}
                    </Button>
                  </Link>
                )}
                {session.user?.role === "ADMIN" && (
                  <>
                    <Link href="/admin">
                      <Button variant="secondary" size="sm">
                        {t.admin}
                      </Button>
                    </Link>
                    <Link href="/admin/orders/confirm">
                      <Button variant="secondary" size="sm">
                        {t.orders}
                      </Button>
                    </Link>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-[#1B2632] flex items-center bg-transparent"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.logout}
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white hover:text-[#1B2632] flex items-center bg-transparent"
                  >
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

        {/* Mobile Navigation: backdrop + sliding drawer from right */}
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
              mobileMenuOpen ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding panel */}
          <aside
            className={`fixed top-0 right-0 h-full z-50 w-72 max-w-full text-white transform transition-transform duration-300 ease-in-out bg-gradient-to-r from-[#1B2632] to-[#2C3B4D] shadow-lg ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 overflow-y-auto h-full">
              <div className="mb-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium hover:bg-white/10 rounded ${
                      pathname === item.href ? "text-[#f56a24]" : "text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-white/20">
                <div className="px-3 py-2 text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t.language || "Language"}
                </div>
                <div className="space-y-1 pl-3">
                  <button
                    onClick={() => {
                      setLanguage("fr")
                      setMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                      language === "fr" ? "text-[#f56a24] font-medium" : "text-white"
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en")
                      setMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                      language === "en" ? "text-[#f56a24] font-medium" : "text-white"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("ar")
                      setMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                      language === "ar" ? "text-[#f56a24] font-medium" : "text-white"
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 space-y-2 border-t border-white/20">
                {status === "loading" ? (
                  <div className="px-3 text-sm text-gray-300">{t.loading}...</div>
                ) : session ? (
                  <div className="space-y-2 px-1">
                    <div className="px-3 text-sm text-gray-300">{session.user?.email}</div>

                    {session.user?.role === "OPTICIAN" && (
                      <Link href="/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="secondary" size="sm" className="w-full">
                          {t.myProfile}
                        </Button>
                      </Link>
                    )}

                    {session.user?.role === "ADMIN" && (
                      <>
                        <Link href="/admin" className="block" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="secondary" size="sm" className="w-full">
                            {t.admin}
                          </Button>
                        </Link>
                        <Link href="/admin/orders/confirm" className="block" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="secondary" size="sm" className="w-full">
                            {t.orders}
                          </Button>
                        </Link>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="w-full border-white text-white hover:bg-white hover:text-[#1B2632] bg-transparent flex items-center justify-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t.logout}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/signin" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white text-white hover:bg-white hover:text-[#1B2632] bg-transparent"
                      >
                        {t.login}
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">
                        {t.signup}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </nav>
    </header>
  )
}
