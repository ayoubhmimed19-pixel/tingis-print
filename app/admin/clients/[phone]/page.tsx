'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowRight, FaWhatsapp } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import { Lead, KANBAN_COLUMNS, PRIORITY_LABELS, PRIORITY_COLORS, getInitials, waLink, formatDate } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

const WA_TEMPLATES = [
  { label: 'تأكيد الطلب',     msg: (name: string, service: string) => `السلام عليكم ${name}، تم استلام طلبكم للخدمة: ${service}. سنتواصل معكم قريباً لتأكيد التفاصيل. شكراً لثقتكم في Tingis Print 🙏` },
  { label: 'طلب التفاصيل',    msg: (name: string, service: string) => `السلام عليكم ${name}، بخصوص طلب ${service}، نحتاج بعض التفاصيل الإضافية: الكمية المطلوبة، الألوان المفضلة، وأي ملاحظات خاصة. شكراً` },
  { label: 'جاهزية الطلب',    msg: (name: string, service: string) => `السلام عليكم ${name}، يسعدنا إخباركم أن طلبكم (${service}) أصبح جاهزاً للتسليم. يمكنكم التواصل معنا لتحديد موعد الاستلام. Tingis Print 📦` },
  { label: 'متابعة الطلب',    msg: (name: string, _: string) => `السلام عليكم ${name}، نتمنى أن تكونوا بخير. أردنا فقط متابعة طلبكم والتأكد من رضاكم عن خدماتنا. هل تحتاجون أي مساعدة إضافية؟` },
  { label: 'عرض خاص',        msg: (name: string, _: string) => `السلام عليكم ${name}، لدينا عرض خاص لعملائنا المميزين! خصم 15% على طلبكم القادم. لا تفوتوا الفرصة 🎉 Tingis Print` },
]

export default function ClientProfilePage() {
  const { phone } = useParams<{ phone: string }>()
  const router = useRouter()
  const decodedPhone = decodeURIComponent(phone)

  const [leads, setLeads]     = useState<Lead[]>([])
  const [note, setNote]       = useState('')
  const [notes, setNotes]     = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [savingNote, setSavingNote] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const clientLeads = (data as Lead[]).filter(l =>
      l.phone.replace(/\D/g, '') === decodedPhone.replace(/\D/g, '')
    )
    setLeads(clientLeads)
    setLoading(false)
  }, [decodedPhone])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
    })
    fetchData()

    // Load notes from localStorage
    const saved = localStorage.getItem(`client-notes-${decodedPhone}`)
    if (saved) setNotes(JSON.parse(saved))
  }, [router, fetchData, decodedPhone])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setSavingNote(true)
    const updated = [...notes, `${new Date().toLocaleDateString('ar-MA')} — ${note.trim()}`]
    setNotes(updated)
    localStorage.setItem(`client-notes-${decodedPhone}`, JSON.stringify(updated))
    setNote('')
    setSavingNote(false)
    toast.success('تمت إضافة الملاحظة')
  }

  const removeNote = (i: number) => {
    const updated = notes.filter((_, j) => j !== i)
    setNotes(updated)
    localStorage.setItem(`client-notes-${decodedPhone}`, JSON.stringify(updated))
  }

  if (loading || leads.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, marginRight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
          {loading ? 'جارٍ التحميل...' : 'العميل غير موجود'}
        </div>
      </div>
    )
  }

  const client = leads[0]
  const services = Array.from(new Set(leads.map(l => l.service)))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />

      <div style={{ flex: 1, marginRight: '220px', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/admin/clients" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>
              <FaArrowRight />
              العملاء
            </Link>
            <span style={{ color: '#374151' }}>/</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{client.name}</span>
          </div>
          {userId && <NotificationBell userId={userId} />}
        </header>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

          {/* Left: Orders + Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Client Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(22,169,234,0.15)', border: '2px solid rgba(22,169,234,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, color: '#16a9ea',
                }}>
                  {getInitials(client.name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'white' }}>{client.name}</h2>
                  <div style={{ fontSize: '13px', color: '#6b7280', direction: 'ltr', marginTop: '2px' }}>{client.phone}</div>
                </div>
                <a href={waLink(client.phone, client.name, services[0])} target="_blank" rel="noopener noreferrer"
                  style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  <FaWhatsapp />
                  واتساب
                </a>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(22,169,234,0.08)', border: '1px solid rgba(22,169,234,0.15)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a9ea' }}>{leads.length}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>إجمالي الطلبات</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e' }}>{leads.filter(l => l.kanban_column === 'completed').length}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>مكتمل</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>الخدمات المطلوبة</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {services.map(s => (
                      <span key={s} style={{ background: 'rgba(22,169,234,0.1)', color: '#16a9ea', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'white' }}>سجل الطلبات</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leads.map(lead => {
                  const col = KANBAN_COLUMNS.find(c => c.id === (lead.kanban_column || 'new'))
                  return (
                    <Link key={lead.id} href={`/admin/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.15s',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{lead.service}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatDate(lead.created_at)}</div>
                          {lead.message && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message}</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${col?.color}20`, color: col?.color }}>{col?.label}</span>
                          {lead.priority && lead.priority !== 'normal' && (
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: `${PRIORITY_COLORS[lead.priority]}15`, color: PRIORITY_COLORS[lead.priority] }}>{PRIORITY_LABELS[lead.priority]}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'white' }}>ملاحظات خاصة</h3>
              {notes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {notes.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(255,220,13,0.05)', border: '1px solid rgba(255,220,13,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#d1d5db', flex: 1, lineHeight: 1.5 }}>{n}</p>
                      <button onClick={() => removeNote(i)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="أضف ملاحظة..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '9px 12px', color: 'white', fontSize: '13px',
                    outline: 'none', fontFamily: 'Cairo, sans-serif', textAlign: 'right',
                  }}
                />
                <button type="submit" disabled={!note.trim() || savingNote} style={{
                  background: '#16a9ea', color: 'white', border: 'none', borderRadius: '10px',
                  padding: '9px 16px', fontWeight: 700, fontSize: '13px',
                  cursor: !note.trim() ? 'not-allowed' : 'pointer', opacity: !note.trim() ? 0.5 : 1,
                  fontFamily: 'Cairo, sans-serif',
                }}>
                  إضافة
                </button>
              </form>
            </div>
          </div>

          {/* Right: WhatsApp Templates */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px', position: 'sticky', top: '76px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaWhatsapp style={{ color: '#22c55e' }} />
                قوالب واتساب السريعة
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {WA_TEMPLATES.map((tpl, i) => (
                  <a
                    key={i}
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(tpl.msg(client.name, services[0] || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                      borderRadius: '10px', padding: '10px 14px', textDecoration: 'none',
                      color: '#d1d5db', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    <FaWhatsapp style={{ color: '#22c55e', fontSize: '16px', flexShrink: 0 }} />
                    {tpl.label}
                  </a>
                ))}
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px', fontWeight: 600 }}>آخر تواصل</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(leads[0].created_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="margin-right: 220px"] { margin-right: 0 !important; } }`}</style>
    </div>
  )
}
