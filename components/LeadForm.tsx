'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp, FaPaperPlane, FaCheckCircle } from 'react-icons/fa'
import { supabase, SERVICES } from '@/lib/supabase'

const WA_URL = 'https://wa.me/212670315011'

export default function LeadForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.service) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setLoading(true)
    try {
      const { error: dbError } = await supabase.from('leads').insert([
        {
          name: form.name,
          phone: form.phone,
          service: form.service,
          message: form.message,
          status: 'new',
        },
      ])

      if (dbError) throw dbError

      setSuccess(true)
      setForm({ name: '', phone: '', service: '', message: '' })
    } catch {
      // إذا فشل الاتصال بقاعدة البيانات، حوّل للواتساب
      const msg = `السلام عليكم، اسمي ${form.name}. أريد الاستفسار عن: ${form.service}. رقمي: ${form.phone}. ${form.message}`
      window.open(`${WA_URL}?text=${encodeURIComponent(msg)}`, '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-badge"
            >
              أرسل طلبك
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title mb-4"
            >
              أخبرنا عن
              <span className="gradient-text"> مشروعك</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-subtitle mx-auto"
            >
              سنرد عليك في أقرب وقت ممكن عبر واتساب
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            {success ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <FaCheckCircle className="text-green-400 text-7xl mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-3">تم استلام طلبك!</h3>
                <p className="text-gray-400 mb-6">
                  سنتواصل معك قريباً عبر واتساب على الرقم الذي أدخلته
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-primary font-bold underline text-sm"
                >
                  إرسال طلب آخر
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass-card rounded-2xl p-8 flex flex-col gap-5"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    الاسم الكامل <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="مثال: محمد العلوي"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-right"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    رقم الهاتف (واتساب) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0612345678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all text-right"
                    required
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    الخدمة المطلوبة <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all text-right"
                    required
                  >
                    <option value="" className="text-gray-500">
                      اختر الخدمة...
                    </option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s} className="bg-gray-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    تفاصيل إضافية{' '}
                    <span className="text-gray-500 font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="صف مشروعك، الكمية المطلوبة، الألوان، أي تفاصيل مفيدة..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all text-right resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                </button>

                <p className="text-center text-gray-600 text-xs">
                  أو تواصل معنا مباشرة على{' '}
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <FaWhatsapp />
                    واتساب
                  </a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
