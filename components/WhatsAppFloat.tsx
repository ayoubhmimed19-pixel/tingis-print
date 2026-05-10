'use client'

import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

export default function WhatsAppFloat() {
  return (
    <motion.a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 text-white rounded-full shadow-2xl shadow-green-500/40 hover:bg-green-600 transition-colors overflow-hidden group"
      aria-label="تواصل معنا عبر واتساب"
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
        >
          <FaWhatsapp className="text-3xl" />
        </motion.div>
        <span className="font-black text-base hidden sm:block whitespace-nowrap">
          تواصل معنا
        </span>
      </div>
      <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20 pointer-events-none" />
    </motion.a>
  )
}
