'use client'

import { motion } from 'framer-motion'
import {
  FaCheckCircle,
  FaChartLine,
  FaBrain,
  FaRocket,
  FaShieldAlt,
} from 'react-icons/fa'

const benefits = [
  {
    icon: FaShieldAlt,
    title: 'تبدو أكثر احترافية',
    desc: 'يحكم العملاء على العلامة التجارية من النظرة الأولى. مع مظهر احترافي — طباعة نظيفة، تغليف راقٍ، هوية واضحة — يثقون بك فوراً ويشترون دون تردد.',
    color: 'text-primary',
    highlight: 'الثقة = المبيعات',
  },
  {
    icon: FaChartLine,
    title: 'تبيع أكثر',
    desc: 'الطباعة والتغليف الجيدان ليسا مجرد جماليات — إنهما أداة بيع حقيقية. المنتج المغلّف بإتقان يُباع بسعر أعلى ويخلق فارقاً واضحاً بينك وبين المنافسين.',
    color: 'text-green-400',
    highlight: '+30% في المبيعات',
  },
  {
    icon: FaBrain,
    title: 'تبني هوية قوية',
    desc: 'العلامة التجارية التي يتذكرها الناس هي التي تربح. نساعدك أن تكون الأول الذي يتبادر إلى ذهن العميل عند الحاجة — هذا هو الفارق بين علامة عادية وناجحة.',
    color: 'text-purple-400',
    highlight: 'الهوية = التميز',
  },
  {
    icon: FaCheckCircle,
    title: 'تبدأ صحيحاً من الأول',
    desc: 'مع استشارتنا المجانية، نرشدك لتجنب الأخطاء المكلفة التي تستنزف وقت المبتدئين وأموالهم. ابدأ على أساس متين دون الضياع في التجارب.',
    color: 'text-secondary',
    highlight: 'توفير الوقت والمال',
  },
  {
    icon: FaRocket,
    title: 'تنمو بسرعة',
    desc: 'مع خدمة الدروبشيبينغ لدينا، يمكنك التوسع دون رأس مال كبير ودون ضغط لوجستي. أنت تبيع ونحن نتكفل بكل التفاصيل.',
    color: 'text-orange-400',
    highlight: 'توسّع بلا ضغط',
  },
]

export default function Benefits() {
  return (
    <section className="py-24 md:py-32 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            فوائد التعاون معنا
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            كيف تساعد Tingis Print
            <br />
            <span className="gradient-text">مشروعك على النمو؟</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            ليست مجرد خدمة — نتائج حقيقية تؤثر في مشروعك منذ اليوم الأول
          </motion.p>
        </div>

        {/* Benefits */}
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group glass-card p-6 md:p-8 rounded-2xl hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${benefit.color} text-2xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl md:text-2xl font-black text-white">{benefit.title}</h3>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full bg-white/5 ${benefit.color}`}
                    >
                      {benefit.highlight}
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{benefit.desc}</p>
                </div>

                <div className="hidden md:block flex-shrink-0 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
