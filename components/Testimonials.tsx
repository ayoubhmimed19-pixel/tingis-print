'use client'

import { motion } from 'framer-motion'
import { FaStar, FaQuoteRight } from 'react-icons/fa'

const reviews = [
  {
    name: 'سارة المودني',
    type: 'صاحبة علامة ملابس',
    avatar: 'س',
    avatarColor: 'bg-pink-500',
    stars: 5,
    text: 'لم أتوقع أن تكون النتيجة بهذا المستوى الرائع. طلبت تي-شيرتات لمجموعة الصيف وجاءت بشكل أشعر معه بالفخر أمام عملائي. الجودة عالية، التسليم في الموعد، والفريق رافقني من البداية حتى النهاية. أنصح بهم لكل صاحب مشروع!',
    project: 'طباعة تي-شيرتات',
  },
  {
    name: 'يوسف الحسن',
    type: 'صاحب مطعم',
    avatar: 'ي',
    avatarColor: 'bg-blue-500',
    stars: 5,
    text: 'احتجت بطاقات أعمال ومنشورات للمطعم. قام فريق Tingis Print بتصميم وطباعة كل شيء وجاء بمستوى راقٍ جداً. عملائي يسألونني من أين حصلت عليها — هذا أعظم مديح يمكن سماعه!',
    project: 'هوية بصرية ومواد إعلانية',
  },
  {
    name: 'إيمان بنعيسى',
    type: 'صاحبة مشروع هدايا',
    avatar: 'إ',
    avatarColor: 'bg-purple-500',
    stars: 5,
    text: 'كنت أخشى بدء خدمة الدروبشيبينغ لعدم امتلاكي الخبرة. أرشدني فريق Tingis Print من الصفر، وشرحوا لي كل شيء بالتفصيل، والآن أبيع بشكل منتظم ويتكفلون بكل شيء. أفضل قرار اتخذته في مشروعي!',
    project: 'دروبشيبينغ واستشارات',
  },
  {
    name: 'كريم الفاسي',
    type: 'مدير شركة إعلانية',
    avatar: 'ك',
    avatarColor: 'bg-green-500',
    stars: 5,
    text: 'تعاملنا معهم على مشروع كبير — لافتات، منشورات، حوامل لمعرض تجاري. جاء كل شيء في الموعد المحدد وبجودة لم أرها عند غيرهم في المغرب. هؤلاء يعرفون معنى العمل الجاد والاحترافي!',
    project: 'مشروع معرض تجاري',
  },
  {
    name: 'لطيفة الزاهيري',
    type: 'صاحبة علامة ملابس نسائية',
    avatar: 'ل',
    avatarColor: 'bg-rose-500',
    stars: 5,
    text: 'كنت أخشى التجربة لكن من أول طلب أثبتوا مستواهم. تي-شيرتاتي جاءت أفضل مما توقعت. الآن لا أتعامل إلا معهم ولا أرغب في تجربة غيرهم. شركة تستحق الثقة حقاً!',
    project: 'طباعة ملابس نسائية',
  },
  {
    name: 'أمين الراشدي',
    type: 'صاحب مقهى',
    avatar: 'أ',
    avatarColor: 'bg-amber-500',
    stars: 5,
    text: 'طلبت أكياساً وأكواباً بشعار مقهاي. جاء كل شيء احترافياً ورائعاً في وقت قصير. عملائي معجبون جداً وبدأ الناس يسألون عن المقهى بسبب مظهره. الطباعة ليست مجرد طباعة — إنها إعلان دائم!',
    project: 'تغليف وهوية مقهى',
  },
]

export default function Testimonials() {
  return (
    <section id="reviews" className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-badge"
          >
            آراء عملائنا
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title mb-4"
          >
            هل تتساءل عن الجودة؟
            <br />
            <span className="gradient-text">إليك ما قاله عملاؤنا</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto"
          >
            مئات العملاء وثقوا بنا — كلامهم خير دليل على مستوانا
          </motion.p>

          {/* Stars summary */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mt-6 bg-secondary/10 border border-secondary/30 px-5 py-2.5 rounded-full"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-secondary text-lg" />
              ))}
            </div>
            <span className="text-secondary font-black text-lg">5.0</span>
            <span className="text-gray-400 text-sm">من تقييمات العملاء</span>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-card p-6 rounded-2xl flex flex-col gap-4 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <FaQuoteRight className="text-primary/30 text-3xl" />

              <div className="flex gap-1">
                {[...Array(review.stars)].map((_, j) => (
                  <FaStar key={j} className="text-secondary text-sm" />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>

              <span className="inline-block text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full w-fit">
                {review.project}
              </span>

              <div className="border-t border-white/5" />

              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}
                >
                  {review.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.type}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 text-sm mt-10"
        >
          هؤلاء مجرد بعض من مئات العملاء الراضين عن خدماتنا 🇲🇦
        </motion.p>
      </div>
    </section>
  )
}
