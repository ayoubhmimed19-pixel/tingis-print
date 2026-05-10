'use client'

import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'

const stats = [
  {
    value: 500,
    suffix: '+',
    label: 'مشروع منجز',
    desc: 'في مختلف المجالات',
    color: 'text-primary',
  },
  {
    value: 3,
    suffix: '+',
    label: 'سنوات خبرة',
    desc: 'في الطباعة الاحترافية',
    color: 'text-secondary',
  },
  {
    value: 200,
    suffix: '+',
    label: 'عميل راضٍ',
    desc: 'من جميع أنحاء المغرب',
    color: 'text-primary',
  },
  {
    value: 7,
    suffix: '/7',
    label: 'دعم متواصل',
    desc: 'دائماً في خدمتك',
    color: 'text-secondary',
  },
]

export default function Stats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section ref={ref} className="relative py-16 bg-gray-900 border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className={`text-5xl md:text-6xl font-black mb-1 ${stat.color}`}>
                {inView ? (
                  <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>
              <div className="text-white font-black text-lg md:text-xl mb-1">{stat.label}</div>
              <div className="text-gray-500 text-sm">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
