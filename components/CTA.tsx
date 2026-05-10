'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

export default function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0b2a42 0%, #0a1628 40%, #0d1b0f 100%)',
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-primary to-transparent" />

      <div className="relative container mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary px-5 py-2.5 rounded-full text-sm font-bold mb-8"
        >
          <HiSparkles className="text-secondary" />
          استشارة مجانية — بدون رسوم خفية
          <HiSparkles className="text-secondary" />
        </motion.div>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
        >
          هل أنت مستعد لمنح
          <br />
          <span className="text-primary">علامتك التجارية المظهر الذي تستحقه؟</span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          رسالة واحدة على واتساب تكفي.
          <br className="hidden sm:block" />
          نرد عليك بسرعة ونساعدك في اختيار ما يناسب مشروعك بالضبط.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10"
        >
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
          >
            <FaWhatsapp className="text-2xl" />
            تواصل معنا الآن
          </a>
          <a
            href="mailto:printtingis@gmail.com"
            className="flex items-center gap-3 glass-card border border-white/10 hover:border-primary/40 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:shadow-xl w-full sm:w-auto justify-center"
          >
            <FaEnvelope className="text-primary" />
            راسلنا عبر البريد الإلكتروني
          </a>
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm"
        >
          {[
            '✅ استشارة مجانية',
            '✅ بدون التزام',
            '✅ رد سريع',
            '✅ أسعار واضحة',
          ].map((item, i) => (
            <span key={i} className="font-semibold">{item}</span>
          ))}
        </motion.div>

        {/* Price note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 inline-block glass-card px-6 py-4 rounded-xl max-w-xl"
        >
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-secondary font-bold">ملاحظة:</span> لا نعرض الأسعار على الموقع
            لأن كل مشروع فريد ومختلف. تواصل معنا عبر واتساب وسنحسب لك السعر المناسب بدقة.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
