'use client'

import { motion } from 'framer-motion'
import {
  FaTrophy,
  FaStar,
  FaBolt,
  FaHandshake,
  FaMoneyBillWave,
  FaGraduationCap,
} from 'react-icons/fa'

const features = [
  {
    icon: FaTrophy,
    title: 'خبرة حقيقية',
    desc: 'عملنا مع مئات المشاريع والعلامات التجارية في المغرب. كل مشروع نوليه اهتماماً كاملاً ونعمل بجدية من البداية حتى النهاية.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  {
    icon: FaStar,
    title: 'جودة لا تُضاهى',
    desc: 'نستخدم أجود المواد والتقنيات الحديثة. النتيجة دائماً واضحة — طباعة نظيفة، ألوان حية، ومواد متينة تدوم.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: FaBolt,
    title: 'سرعة في التنفيذ',
    desc: 'وقتك ثمين. نعمل بسرعة دون المساس بالجودة. مشروعك يصلك في الوقت المحدد دون أي تأخير.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  {
    icon: FaHandshake,
    title: 'دعم متكامل للعميل',
    desc: 'نبقى معك من أول تصميم حتى وصول الطلبية. ليس مجرد خدمة — شراكة حقيقية في نجاح مشروعك.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
  {
    icon: FaMoneyBillWave,
    title: 'توفير الوقت والمال',
    desc: 'نرشدك للعمل الصحيح من البداية. دون إضاعة الوقت أو المال على أخطاء يمكن تجنبها منذ الخطوة الأولى.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: FaGraduationCap,
    title: 'للمبتدئين والمحترفين',
    desc: 'لا تملك خبرة في الطباعة؟ لا مشكلة! نعلّمك ونرشدك خطوة بخطوة من الصفر حتى تصبح مستقلاً ومتمكناً.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
]

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            لماذا Tingis Print؟
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            ليس مجرد طباعة —
            <br />
            <span className="gradient-text">شريك حقيقي في نجاحك</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            كثير من أصحاب المشاريع جربوا آخرين وخرجوا بخسائر. معنا، تحصل على ما تستحقه بالضبط
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group p-6 rounded-2xl border ${feat.border} ${feat.bg} backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 ${feat.color} text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feat.icon />
              </div>
              <h3 className="text-xl font-black text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-block glass-card px-8 py-6 rounded-2xl max-w-2xl">
            <p className="text-xl md:text-2xl font-black text-white leading-relaxed">
              &ldquo;هدفنا ليس مجرد الطباعة — هدفنا{' '}
              <span className="text-primary">مساعدتك على النجاح</span> وتنمية مشروعك&rdquo;
            </p>
            <p className="text-gray-500 text-sm mt-3">— فريق Tingis Print</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
