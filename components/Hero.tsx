'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaChevronDown } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

const trustItems = [
  '✅ أكثر من 500 مشروع منجز',
  '✅ جودة مضمونة',
  '✅ خدمة سريعة',
  '✅ دعم متكامل',
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-100" />
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] orb-blue opacity-60" />
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] orb-yellow opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/30 to-gray-950" />
      </div>

      {/* Floating geometric shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-10 w-16 h-16 border-2 border-primary/30 rounded-xl hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/3 right-16 w-10 h-10 bg-secondary/20 rounded-full hidden md:block"
      />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 left-20 w-8 h-8 border border-secondary/40 rotate-45 hidden md:block"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center py-32 pt-40">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-5 py-2.5 rounded-full text-sm font-bold mb-8"
        >
          <HiSparkles className="text-secondary" />
          الشريك الأمثل للطباعة الاحترافية بالمغرب
          <HiSparkles className="text-secondary" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
        >
          علامتك التجارية
          <br />
          <span className="relative inline-block mt-2">
            <span className="text-primary">تستحق</span>
            <span className="text-white mx-3">الجودة التي</span>
            <span className="relative inline-block">
              <span className="relative z-10">تمثّلها</span>
              <span
                className="absolute bottom-1 right-0 left-0 h-4 rounded-md"
                style={{ background: 'rgba(251,220,13,0.35)' }}
              />
            </span>
          </span>
        </motion.h1>

        {/* Sub headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          مع{' '}
          <span className="text-primary font-bold">Tingis Print</span>، نطبع
          باحترافية ونساعدك على بناء صورة مهنية تبيع وتتميز.
          <br className="hidden sm:block" />
          من الملابس والحقائب إلى التغليف والهوية البصرية — كل شيء بأعلى مستوى.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full sm:w-auto"
          >
            <FaWhatsapp className="text-2xl flex-shrink-0" />
            تواصل معنا عبر واتساب
          </a>
          <a href="#services" className="btn-outline w-full sm:w-auto">
            اكتشف خدماتنا
            <FaChevronDown className="text-primary text-sm" />
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8"
        >
          {trustItems.map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-gray-400 text-sm font-semibold"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-semibold tracking-widest">تمرير للأسفل</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <FaChevronDown />
        </motion.div>
      </motion.div>
    </section>
  )
}
