'use client'

import { motion } from 'framer-motion'
import { FaInstagram, FaExternalLinkAlt } from 'react-icons/fa'

const galleryItems = [
  {
    title: 'طباعة الملابس',
    subtitle: 'تي-شيرتات، هوديات، سترات',
    gradient: 'from-blue-600 via-cyan-500 to-blue-400',
    icon: '👕',
    tag: 'الأكثر طلباً',
    tagColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    title: 'تغليف احترافي',
    subtitle: 'علب، أكياس، ملصقات',
    gradient: 'from-amber-500 via-yellow-400 to-orange-400',
    icon: '📦',
    tag: 'يضيف قيمة',
    tagColor: 'bg-amber-500/20 text-amber-300',
  },
  {
    title: 'الهوية البصرية',
    subtitle: 'شعار، بطاقة أعمال',
    gradient: 'from-purple-600 via-violet-500 to-pink-500',
    icon: '🎨',
    tag: 'ضروري لكل علامة تجارية',
    tagColor: 'bg-purple-500/20 text-purple-300',
  },
  {
    title: 'المواد الإعلانية',
    subtitle: 'لافتات، منشورات، لوحات',
    gradient: 'from-green-600 via-emerald-500 to-teal-400',
    icon: '📢',
    tag: 'حضور قوي',
    tagColor: 'bg-green-500/20 text-green-300',
  },
  {
    title: 'طباعة الحقائب',
    subtitle: 'حقائب تسوق وهدايا',
    gradient: 'from-rose-600 via-pink-500 to-red-400',
    icon: '👜',
    tag: 'هدايا مميزة',
    tagColor: 'bg-rose-500/20 text-rose-300',
  },
  {
    title: 'الدروبشيبينغ',
    subtitle: 'طباعة، تغليف، توصيل',
    gradient: 'from-indigo-600 via-blue-500 to-cyan-400',
    icon: '🚚',
    tag: 'ربح دون ضغط',
    tagColor: 'bg-indigo-500/20 text-indigo-300',
  },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            أعمالنا
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            من مشاريعنا —
            <br />
            <span className="gradient-text">اطّلع بنفسك</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            مشاريع حقيقية، نتائج حقيقية — كل مشروع يحمل عملاً دؤوباً وحرفية واهتماماً بالتفاصيل
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8 text-center">
                <motion.span
                  className="text-7xl mb-4 drop-shadow-lg"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.span>
                <h3 className="text-2xl font-black mb-2 drop-shadow-lg">{item.title}</h3>
                <p className="text-white/80 text-sm mb-4">{item.subtitle}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.tagColor} backdrop-blur-sm`}>
                  {item.tag}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FaExternalLinkAlt className="text-white text-sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-gray-500 mb-5 text-sm">
            اطّلع على المزيد من مشاريعنا على إنستغرام
          </p>
          <a
            href="https://www.instagram.com/tingis_print?igsh=MXZqbXNjZG1pZXc0ZA=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-l from-purple-600 to-pink-500 hover:opacity-90 text-white px-7 py-3.5 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30"
          >
            <FaInstagram className="text-xl" />
            زر صفحتنا على إنستغرام
          </a>
        </motion.div>
      </div>
    </section>
  )
}
