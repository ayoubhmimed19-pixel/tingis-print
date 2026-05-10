'use client'

import { motion } from 'framer-motion'
import {
  FaTshirt,
  FaShoppingBag,
  FaBox,
  FaPalette,
  FaBullhorn,
  FaPrint,
  FaTruck,
  FaUserGraduate,
  FaBuilding,
  FaWhatsapp,
} from 'react-icons/fa'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%2C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20Tingis%20Print'

const services = [
  {
    icon: FaTshirt,
    title: 'طباعة على الملابس',
    desc: 'تي-شيرتات، هوديات، سترات، قبعات — نطبع على جميع أنواع الملابس بجودة واضحة وتدوم طويلاً',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'group-hover:border-blue-400/50',
    iconColor: 'text-blue-400',
    badge: 'الأكثر طلباً',
  },
  {
    icon: FaShoppingBag,
    title: 'طباعة الحقائب',
    desc: 'حقائب تسوق، حقائب هدايا، حقائب ورقية — بشعارك وألوان علامتك التجارية بأسلوب راقٍ ومتين',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'group-hover:border-amber-400/50',
    iconColor: 'text-amber-400',
    badge: '',
  },
  {
    icon: FaBox,
    title: 'تغليف احترافي',
    desc: 'علب، أكياس، ملصقات، كراتين — مواد تغليف تعبّر عن علامتك التجارية وتضيف قيمة حقيقية لمنتجك',
    color: 'from-orange-500/20 to-red-500/10',
    border: 'group-hover:border-orange-400/50',
    iconColor: 'text-orange-400',
    badge: '',
  },
  {
    icon: FaPalette,
    title: 'الهوية البصرية',
    desc: 'شعار، بطاقة أعمال، ألوان العلامة، خط — كل عنصر يعكس مشروعك بجدية واحترافية تامة',
    color: 'from-purple-500/20 to-pink-500/10',
    border: 'group-hover:border-purple-400/50',
    iconColor: 'text-purple-400',
    badge: 'ضروري لكل علامة تجارية',
  },
  {
    icon: FaBullhorn,
    title: 'المواد الإعلانية',
    desc: 'لافتات، منشورات، كتيبات، لوحات إعلانية، خلفيات — حضور قوي في كل مكان ومناسبة',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'group-hover:border-green-400/50',
    iconColor: 'text-green-400',
    badge: '',
  },
  {
    icon: FaPrint,
    title: 'طباعة مخصصة',
    desc: 'هل لديك تصميم خاص في ذهنك؟ نحوّله إلى واقع بدقة وجودة عالية — أي شيء تتخيله ننفّذه',
    color: 'from-primary/20 to-blue-500/10',
    border: 'group-hover:border-primary/50',
    iconColor: 'text-primary',
    badge: '',
  },
  {
    icon: FaTruck,
    title: 'خدمة الدروبشيبينغ',
    desc: 'بع بسعرك ونحن نتكفل بالطباعة والتغليف والتوصيل — اربح بكل راحة دون أي ضغط لوجستي',
    color: 'from-indigo-500/20 to-violet-500/10',
    border: 'group-hover:border-indigo-400/50',
    iconColor: 'text-indigo-400',
    badge: 'خدمة مميزة',
  },
  {
    icon: FaUserGraduate,
    title: 'استشارات الطباعة',
    desc: 'هل تريد بدء مشروع طباعة دون خبرة؟ نرشدك من الصفر حتى تحقيق أول ربح حقيقي',
    color: 'from-teal-500/20 to-cyan-500/10',
    border: 'group-hover:border-teal-400/50',
    iconColor: 'text-teal-400',
    badge: '',
  },
  {
    icon: FaBuilding,
    title: 'هوية الشركات',
    desc: 'نساعد الشركات والمتاجر والمطاعم على بناء صورة احترافية متكاملة تميّزها في السوق',
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'group-hover:border-rose-400/50',
    iconColor: 'text-rose-400',
    badge: '',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            خدماتنا
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            كل شيء بمستوى عالٍ
            <br />
            <span className="gradient-text">في مكان واحد</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            من الطباعة إلى الاستشارة — نقدم كل ما يحتاجه مشروعك للنمو والتميز في السوق
          </motion.p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative glass-card p-6 cursor-pointer transition-all duration-300 border ${service.border} hover:shadow-xl hover:shadow-primary/10 overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {service.badge && (
                <span className="absolute top-4 left-4 bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                  {service.badge}
                </span>
              )}

              <div className="relative z-10">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-4 ${service.iconColor} text-2xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon />
                </div>

                <h3 className="text-xl font-black text-white mb-3">{service.title}</h3>

                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {service.desc}
                </p>

                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary text-sm font-bold hover:gap-3 transition-all duration-200"
                >
                  استفسر عنها
                  <span className="text-xs">←</span>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 mb-6 text-sm">
            لم تجد ما تبحث عنه؟ تواصل معنا وسنرشدك
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
          >
            <FaWhatsapp className="text-xl" />
            تواصل معنا الآن
          </a>
        </motion.div>
      </div>
    </section>
  )
}
