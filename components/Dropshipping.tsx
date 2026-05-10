'use client'

import { motion } from 'framer-motion'
import {
  FaUser,
  FaPrint,
  FaBox,
  FaTruck,
  FaMoneyBillWave,
  FaWhatsapp,
  FaArrowLeft,
} from 'react-icons/fa'

const WA_URL =
  'https://wa.me/212670315011?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A9%20%D8%A7%D9%84%D8%AF%D8%B1%D9%88%D8%A8%D8%B4%D9%8A%D8%A8%D9%8A%D9%86%D8%AC'

const steps = [
  {
    icon: FaUser,
    step: '01',
    title: 'أنت تجلب العميل',
    desc: 'روّج عبر منصاتك الاجتماعية وبع بالسعر الذي تحدده أنت',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  {
    icon: FaPrint,
    step: '02',
    title: 'نحن نطبع',
    desc: 'نطبع بجودة عالية على المواد التي اختارها عميلك باحترافية تامة',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
  },
  {
    icon: FaBox,
    step: '03',
    title: 'نحن نغلّف',
    desc: 'تغليف احترافي يعبّر عن علامتك ويُرضي عميلك منذ لحظة فتح الطلبية',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
  },
  {
    icon: FaTruck,
    step: '04',
    title: 'نحن نوصّل',
    desc: 'توصيل سريع وآمن لعميلك في أي مكان بالمغرب — دون أي قلق من جانبك',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
  },
  {
    icon: FaMoneyBillWave,
    step: '05',
    title: 'أنت تربح',
    desc: 'تحصل على الفارق بين سعرك وسعرنا — ربح حقيقي دون رأس مال كبير',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
]

const perks = [
  'بلا مخزون — بلا ضغط لوجستي',
  'أنت تحدد سعرك وتربح الفارق',
  'نتابع مع عملائك نيابةً عنك',
  'اعمل من أي مكان وفي أي وقت',
  'ابدأ دون رأس مال كبير',
  'نرشدك إلى المنتجات الأكثر طلباً',
]

export default function Dropshipping() {
  return (
    <section
      id="dropshipping"
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 50%, #0a1628 100%)',
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            خدمة الدروبشيبينغ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            بع بكل راحة —
            <br />
            <span className="gradient-text">نحن نتكفل بكل شيء</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            مع نظام الدروبشيبينغ لدينا، يمكنك بناء تجارة ناجحة دون القلق على الطباعة والتوصيل
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="hidden lg:block absolute top-12 right-[15%] left-[15%] h-0.5 bg-gradient-to-l from-green-400/30 via-primary/50 to-primary/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div
                  className={`${step.bg} border ${step.border} rounded-2xl p-5 text-center h-full flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300`}
                >
                  <span className="text-xs font-black text-gray-600">{step.step}</span>
                  <div
                    className={`w-14 h-14 rounded-full ${step.bg} border ${step.border} flex items-center justify-center ${step.color} text-xl`}
                  >
                    <step.icon />
                  </div>
                  <h3 className="font-black text-white text-base">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>

                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-2 text-gray-600">
                    <FaArrowLeft className="rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-card rounded-2xl p-8"
        >
          <h3 className="text-2xl font-black text-white text-center mb-8">
            ما الذي تستفيد منه مع الدروبشيبينغ لدينا؟
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0">
                  ✓
                </span>
                <span className="font-semibold text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            هل تريد بدء خدمة الدروبشيبينغ؟ تواصل معنا وسنشرح لك كل التفاصيل مجاناً
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
          >
            <FaWhatsapp className="text-xl" />
            ابدأ الدروبشيبينغ الآن
          </a>
        </motion.div>
      </div>
    </section>
  )
}
