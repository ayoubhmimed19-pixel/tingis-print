'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

const navLinks = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'خدماتنا', href: '#services' },
  { label: 'لماذا نحن', href: '#why-us' },
  { label: 'الدروبشيبينغ', href: '#dropshipping' },
  { label: 'آراء العملاء', href: '#reviews' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = () => setIsOpen(false)

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-gray-950/95 backdrop-blur-xl shadow-xl shadow-black/30 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo-v2.png"
              alt="Tingis Print"
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-primary font-semibold text-sm transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
          >
            <FaWhatsapp className="text-lg" />
            واتساب
          </a>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="القائمة"
          >
            {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-gray-950/98 backdrop-blur-xl border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-primary font-semibold py-3 text-right border-b border-white/5 transition-colors"
                  onClick={handleNavClick}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-4 rounded-xl font-black text-base transition-colors"
                onClick={handleNavClick}
              >
                <FaWhatsapp className="text-xl" />
                تواصل معنا عبر واتساب
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
