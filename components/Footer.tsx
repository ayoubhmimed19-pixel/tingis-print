'use client'

import Image from 'next/image'
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaHeart,
} from 'react-icons/fa'
import { FaTiktok } from 'react-icons/fa6'
import { motion } from 'framer-motion'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

const quickLinks = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'خدماتنا', href: '#services' },
  { label: 'لماذا نحن', href: '#why-us' },
  { label: 'الدروبشيبينغ', href: '#dropshipping' },
  { label: 'آراء العملاء', href: '#reviews' },
  { label: 'تواصل معنا', href: WA_URL },
]

const services = [
  'طباعة الملابس',
  'طباعة الحقائب',
  'تغليف احترافي',
  'الهوية البصرية',
  'المواد الإعلانية',
  'طباعة مخصصة',
  'الدروبشيبينغ',
  'استشارات الطباعة',
]

const socials = [
  {
    icon: FaWhatsapp,
    href: WA_URL,
    label: 'واتساب',
    color: 'hover:bg-green-500',
    bg: 'bg-green-500/10 border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    icon: FaFacebook,
    href: 'https://www.facebook.com/share/1AmkWKGmpe/?mibextid=wwXIfr',
    label: 'فيسبوك',
    color: 'hover:bg-blue-600',
    bg: 'bg-blue-600/10 border-blue-600/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/tingis_print?igsh=MXZqbXNjZG1pZXc0ZA==',
    label: 'إنستغرام',
    color: 'hover:bg-pink-600',
    bg: 'bg-pink-600/10 border-pink-600/30',
    iconColor: 'text-pink-400',
  },
  {
    icon: FaTiktok,
    href: 'https://www.tiktok.com/@tingis_print?_r=1&_t=ZS-96BdZDOi2DJ',
    label: 'تيكتوك',
    color: 'hover:bg-gray-800',
    bg: 'bg-white/5 border-white/10',
    iconColor: 'text-white',
  },
  {
    icon: FaEnvelope,
    href: 'mailto:printtingis@gmail.com',
    label: 'البريد الإلكتروني',
    color: 'hover:bg-red-600',
    bg: 'bg-red-600/10 border-red-600/30',
    iconColor: 'text-red-400',
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Image
              src="/logo-v2.png"
              alt="Tingis Print"
              width={150}
              height={50}
              className="h-12 w-auto object-contain mb-5"
            />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              شريكك المثالي في الطباعة والإعلان بالمغرب. نساعدك على بناء علامة تجارية احترافية تبيع وتتميز.
            </p>
            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socials.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl border ${social.bg} ${social.iconColor} flex items-center justify-center transition-all duration-200 ${social.color} hover:text-white hover:border-transparent`}
                >
                  <social.icon className="text-lg" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black text-lg mb-5">روابط سريعة</h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-400 hover:text-primary text-sm font-semibold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-black text-lg mb-5">خدماتنا</h3>
            <ul className="flex flex-col gap-3">
              {services.map((service, i) => (
                <li key={i}>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary text-sm font-semibold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-black text-lg mb-5">تواصل معنا</h3>
            <div className="flex flex-col gap-4">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-green-400 text-sm font-semibold transition-colors group"
              >
                <span className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                  <FaWhatsapp />
                </span>
                +212 670 315 011
              </a>
              <a
                href="mailto:printtingis@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-primary text-sm font-semibold transition-colors group"
              >
                <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <FaEnvelope />
                </span>
                printtingis@gmail.com
              </a>
              <div className="flex items-center gap-3 text-gray-400 text-sm font-semibold">
                <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-gray-400" />
                </span>
                المغرب 🇲🇦
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                مستعدون لمساعدتك! تواصل معنا وسنرد عليك بسرعة.
              </p>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg font-bold text-sm transition-colors"
              >
                <FaWhatsapp />
                واتساب الآن
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} Tingis Print — جميع الحقوق محفوظة 🇲🇦
            </p>
            <p className="text-gray-700 text-sm flex items-center gap-1.5">
              صُنع بـ
              <FaHeart className="text-red-500 text-xs" />
              للعلامات التجارية المغربية
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
