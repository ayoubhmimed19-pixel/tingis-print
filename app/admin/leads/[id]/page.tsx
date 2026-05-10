'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowRight, FaWhatsapp, FaUser, FaTrash, FaClock, FaTag, FaPaperclip, FaFileDownload, FaPrint, FaTimes } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import {
  Lead, OrderActivity, OrderFile, Profile,
  KANBAN_COLUMNS, PRIORITY_LABELS, PRIORITY_COLORS,
  ROLE_LABELS, ROLE_COLORS, waLink, formatDate, getInitials,
} from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

type LeadWithProfile = Lead & { profiles?: Profile | null }

const ACTIVITY_ICONS: Record<string, string> = {
  created: '🆕', status_changed: '🔄', assigned: '👤',
  note_added: '📝', contacted: '📞', completed: '✅', column_moved: '📦',
}

const PREDEFINED_TAGS = ['VIP', 'عاجل', 'دفع متأخر', 'عميل كبير', 'تصميم خاص', 'تسليم سريع']

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [lead, setLead]               = useState<LeadWithProfile | null>(null)
  const [activities, setActivities]   = useState<OrderActivity[]>([])
  const [files, setFiles]             = useState<OrderFile[]>([])
  const [team, setTeam]               = useState<Profile[]>([])
  const [note, setNote]               = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [userId, setUserId]           = useState<string | null>(null)
  const [deadlineInput, setDeadlineInput] = useState('')


  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [leadRes, activitiesRes, teamRes, filesRes] = await Promise.all([
      supabase.from('leads').select('*, profiles!leads_assigned_to_fkey(*)').eq('id', id).single(),
      supabase.from('order_activities').select('*, profiles!order_activities_user_id_fkey(id, name, avatar_url)').eq('lead_id', id).order('created_at', { ascending: true }),
      supabase.from('profiles').select('*').order('name'),
      supabase.from('order_files').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    ])
    if (leadRes.data) {
      const l = leadRes.data as LeadWithProfile
      setLead(l)
      setDeadlineInput(l.deadline ? l.deadline.slice(0, 10) : '')
    }
    if (activitiesRes.data) setActivities(activitiesRes.data as OrderActivity[])
    if (teamRes.data)       setTeam(teamRes.data as Profile[])
    if (filesRes.data)      setFiles(filesRes.data as OrderFile[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
    })
    fetchData()
  }, [router, fetchData])

  const addActivity = async (type: OrderActivity['type'], content: string, meta = {}) => {
    if (!userId) return
    await supabase.from('order_activities').insert({ lead_id: id, user_id: userId, type, content, metadata: meta })
  }

  const handleAssign = async (profileId: string | null) => {
    if (!lead) return
    const assignee = team.find(t => t.id === profileId)
    const { error } = await supabase.from('leads').update({ assigned_to: profileId }).eq('id', id)
    if (error) { toast.error('فشل التعيين'); return }
    setLead(prev => prev ? { ...prev, assigned_to: profileId, profiles: assignee || null } : null)
    await addActivity('assigned', assignee ? `تم التعيين إلى ${assignee.name}` : 'تم إلغاء التعيين')
    if (assignee) {
      await supabase.from('notifications').insert({
        user_id: assignee.id, type: 'assigned',
        title: 'تم تعيينك على طلب جديد',
        body: `طلب من ${lead.name} — ${lead.service}`,
        lead_id: id,
      })
    }
    toast.success('تم التعيين بنجاح')
    fetchData()
  }

  const handlePriority = async (priority: string) => {
    if (!lead) return
    const { error } = await supabase.from('leads').update({ priority }).eq('id', id)
    if (error) { toast.error('فشل التحديث'); return }
    setLead(prev => prev ? { ...prev, priority: priority as Lead['priority'] } : null)
    await addActivity('status_changed', `تغيير الأولوية إلى ${PRIORITY_LABELS[priority as Lead['priority']]}`)
    toast.success('تم تحديث الأولوية')
  }

  const handleKanban = async (col: string) => {
    if (!lead) return
    const colInfo = KANBAN_COLUMNS.find(c => c.id === col)
    const { error } = await supabase.from('leads').update({ kanban_column: col }).eq('id', id)
    if (error) { toast.error('فشل التحديث'); return }
    setLead(prev => prev ? { ...prev, kanban_column: col as Lead['kanban_column'] } : null)
    await addActivity('column_moved', `نقل إلى عمود: ${colInfo?.label}`)
    toast.success('تم تحديث الحالة')
  }

  const handleNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    await addActivity('note_added', note.trim())
    setNote('')
    toast.success('تمت إضافة الملاحظة')
    fetchData()
    setSaving(false)
  }

  const handleTagToggle = async (tag: string) => {
    if (!lead) return
    const currentTags = lead.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    const { error } = await supabase.from('leads').update({ tags: newTags }).eq('id', id)
    if (error) { toast.error('فشل تحديث التصنيف'); return }
    setLead(prev => prev ? { ...prev, tags: newTags } : null)
  }

  const handleDeadline = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDeadlineInput(val)
    const { error } = await supabase.from('leads').update({ deadline: val || null }).eq('id', id)
    if (error) { toast.error('فشل حفظ الموعد'); return }
    setLead(prev => prev ? { ...prev, deadline: val || null } : null)
    toast.success('تم حفظ موعد التسليم')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const path = `${id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('order-files').upload(path, file)
    if (uploadError) { toast.error('فشل رفع الملف'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('order-files').getPublicUrl(path)
    const { error: dbError } = await supabase.from('order_files').insert({
      lead_id: id, name: file.name, url: publicUrl,
      size: file.size, uploaded_by: userId,
    })
    if (dbError) { toast.error('فشل حفظ معلومات الملف'); setUploading(false); return }
    toast.success('تم رفع الملف بنجاح')
    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchData()
    setUploading(false)
  }

  const handleFileDelete = async (fileId: string, url: string) => {
    if (!confirm('هل تريد حذف هذا الملف؟')) return
    const path = url.split('/order-files/')[1]
    if (path) await supabase.storage.from('order-files').remove([path])
    await supabase.from('order_files').delete().eq('id', fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    toast.success('تم حذف الملف')
  }

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف طلب "${lead?.name}"؟`)) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { toast.error('فشل الحذف'); return }
    toast.success('تم الحذف')
    router.push('/admin/dashboard')
  }

  const handlePrint = () => {
    if (!lead) return
    const col = KANBAN_COLUMNS.find(c => c.id === (lead.kanban_column || 'new'))
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${lead.name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Cairo', Arial, sans-serif; background: white; color: #111; padding: 40px; direction: rtl; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #eee; margin-bottom: 24px; }
          .brand { font-size: 28px; font-weight: 900; color: #16a9ea; }
          .brand small { display: block; font-size: 13px; font-weight: 500; color: #666; margin-top: 4px; }
          .invoice-num { text-align: left; font-size: 13px; color: #555; }
          .invoice-num strong { display: block; font-size: 18px; color: #111; font-weight: 700; }
          .section { margin-bottom: 24px; }
          .section h2 { font-size: 13px; font-weight: 700; color: #999; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; }
          .row { display: flex; gap: 32px; margin-bottom: 6px; }
          .row label { font-size: 12px; color: #666; min-width: 120px; }
          .row span { font-size: 13px; font-weight: 600; color: #111; }
          .status { display: inline-block; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #eef6ff; color: #16a9ea; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="header">
          <div class="brand">
            Tingis Print
            <small>الطباعة الاحترافية</small>
          </div>
          <div class="invoice-num">
            <span>رقم الطلب</span>
            <strong>#${id.slice(0, 8).toUpperCase()}</strong>
          </div>
        </div>

        <div class="section">
          <h2>معلومات العميل</h2>
          <div class="row"><label>الاسم</label><span>${lead.name}</span></div>
          <div class="row"><label>الهاتف</label><span>${lead.phone}</span></div>
        </div>

        <div class="section">
          <h2>تفاصيل الطلب</h2>
          <div class="row"><label>الخدمة</label><span>${lead.service}</span></div>
          <div class="row"><label>الحالة</label><span class="status">${col?.label}</span></div>
          ${lead.deadline ? `<div class="row"><label>موعد التسليم</label><span>${new Date(lead.deadline).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>` : ''}
          ${lead.message ? `<div class="row"><label>الملاحظات</label><span>${lead.message}</span></div>` : ''}
        </div>

        <div class="section">
          <h2>تاريخ الطلب</h2>
          <div class="row"><label>تاريخ الإنشاء</label><span>${new Date(lead.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        </div>

        <div class="footer">
          Tingis Print — tingisprint.com — شكرًا لثقتكم بنا
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `)
    win.document.close()
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginRight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (!lead) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginRight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        الطلب غير موجود
      </div>
    </div>
  )

  const col = KANBAN_COLUMNS.find(c => c.id === (lead.kanban_column || 'new'))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />

      <div className="crm-main" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>
              <FaArrowRight />
              العودة
            </Link>
            <span style={{ color: '#374151' }}>/</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{lead.name}</span>
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: `${col?.color}20`, color: col?.color, border: `1px solid ${col?.color}40` }}>
              {col?.label}
            </span>
          </div>
          {userId && <NotificationBell userId={userId} />}
        </header>

        <div className="crm-grid-detail crm-content" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Client Info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(22,169,234,0.15)', border: '1px solid rgba(22,169,234,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700, color: '#16a9ea',
                }}>
                  {getInitials(lead.name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'white' }}>{lead.name}</h2>
                  <div style={{ color: '#16a9ea', fontSize: '13px', fontWeight: 600 }}>{lead.service}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af', direction: 'ltr' }}>{lead.phone}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(lead.created_at)}</span>
              </div>
              {lead.tags && lead.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {lead.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {lead.message && (
                <p style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
                  {lead.message}
                </p>
              )}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={waLink(lead.phone, lead.name, lead.service)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  <FaWhatsapp />
                  تواصل عبر واتساب
                </a>
                <button onClick={handlePrint} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(22,169,234,0.1)', color: '#16a9ea', padding: '8px 14px',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(22,169,234,0.2)',
                  cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                }}>
                  <FaPrint style={{ fontSize: '12px' }} />
                  طباعة الفاتورة
                </button>
                <button onClick={handleDelete} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '8px 14px',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                }}>
                  <FaTrash style={{ fontSize: '12px' }} />
                  حذف الطلب
                </button>
              </div>
            </div>

            {/* Files */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPaperclip style={{ color: '#8b5cf6', fontSize: '14px' }} />
                  الملفات ({files.length})
                </h3>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                  border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px',
                  padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                }}>
                  {uploading ? 'جارٍ الرفع...' : 'رفع ملف'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                  />
                </label>
              </div>
              {files.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', padding: '20px 0', margin: 0 }}>لا توجد ملفات مرفقة</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                      <FaFileDownload style={{ color: '#8b5cf6', fontSize: '16px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                        {f.size && <div style={{ fontSize: '11px', color: '#6b7280' }}>{formatBytes(f.size)}</div>}
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#16a9ea', fontSize: '12px', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                        تحميل
                      </a>
                      <button onClick={() => handleFileDelete(f.id, f.url)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                        <FaTimes style={{ fontSize: '12px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock style={{ color: '#16a9ea', fontSize: '14px' }} />
                سجل النشاط
              </h3>

              {activities.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>لا يوجد نشاط بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {activities.map((act, i) => (
                    <div key={act.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      {i < activities.length - 1 && (
                        <div style={{ position: 'absolute', right: '15px', top: '30px', bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      )}
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                        position: 'relative', zIndex: 1,
                      }}>
                        {ACTIVITY_ICONS[act.type] || '📌'}
                      </div>
                      <div style={{ flex: 1, paddingBottom: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#e5e7eb', fontWeight: 600 }}>{act.content}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          {act.profiles && <span style={{ fontSize: '11px', color: '#16a9ea', fontWeight: 600 }}>{act.profiles.name}</span>}
                          <span style={{ fontSize: '11px', color: '#4b5563' }}>{formatDate(act.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleNote} style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="أضف ملاحظة..."
                  rows={3}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '13px',
                    outline: 'none', fontFamily: 'Cairo, sans-serif', textAlign: 'right', resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button type="submit" disabled={saving || !note.trim()} style={{
                  marginTop: '8px', background: '#16a9ea', color: 'white', border: 'none',
                  borderRadius: '10px', padding: '9px 20px', fontWeight: 700, fontSize: '13px',
                  cursor: saving || !note.trim() ? 'not-allowed' : 'pointer', opacity: !note.trim() ? 0.5 : 1,
                  fontFamily: 'Cairo, sans-serif',
                }}>
                  {saving ? 'جارٍ الحفظ...' : 'إضافة ملاحظة'}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Tags */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaTag style={{ fontSize: '12px' }} />
                التصنيفات
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PREDEFINED_TAGS.map(tag => {
                  const active = (lead.tags || []).includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                        background: active ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: active ? '#f59e0b' : '#6b7280',
                        cursor: 'pointer', fontFamily: 'Cairo, sans-serif', transition: 'all 0.15s',
                      }}
                    >
                      {active && '✓ '}{tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>قيمة الطلب (د.م)</h4>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                defaultValue={lead.price || 0}
                onBlur={async (e) => {
                  const price = parseFloat(e.target.value) || 0
                  const { error } = await supabase.from('leads').update({ price }).eq('id', id)
                  if (error) { toast.error('فشل حفظ القيمة'); return }
                  setLead(prev => prev ? { ...prev, price } : null)
                  if (price > 0) toast.success(`تم حفظ القيمة: ${price.toLocaleString('ar-MA')} د.م`)
                }}
                style={{
                  width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 12px', color: '#22c55e', fontSize: '16px',
                  fontWeight: 700, outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Deadline */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>موعد التسليم</h4>
              <input
                type="date"
                value={deadlineInput}
                onChange={handleDeadline}
                style={{
                  width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '13px',
                  outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box',
                  colorScheme: 'dark',
                }}
              />
            </div>

            {/* Assign */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUser style={{ fontSize: '12px' }} />
                تعيين إلى
              </h4>
              <select
                value={lead.assigned_to || ''}
                onChange={e => handleAssign(e.target.value || null)}
                style={{ width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}
              >
                <option value="">— غير معيّن —</option>
                {team.map(t => (
                  <option key={t.id} value={t.id}>{t.name || t.email} ({ROLE_LABELS[t.role]})</option>
                ))}
              </select>
              {lead.profiles && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${ROLE_COLORS[lead.profiles.role]}20`, border: `1px solid ${ROLE_COLORS[lead.profiles.role]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: ROLE_COLORS[lead.profiles.role] }}>
                    {getInitials(lead.profiles.name || lead.profiles.email)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>{lead.profiles.name}</div>
                    <div style={{ fontSize: '11px', color: ROLE_COLORS[lead.profiles.role] }}>{ROLE_LABELS[lead.profiles.role]}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status / Column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>مرحلة الطلب</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {KANBAN_COLUMNS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleKanban(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 12px', borderRadius: '10px',
                      background: (lead.kanban_column || 'new') === c.id ? c.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${(lead.kanban_column || 'new') === c.id ? c.color : 'rgba(255,255,255,0.06)'}`,
                      color: (lead.kanban_column || 'new') === c.id ? c.color : '#6b7280',
                      cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: 700,
                      textAlign: 'right', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>الأولوية</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {(['low', 'normal', 'high', 'urgent'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePriority(p)}
                    style={{
                      padding: '8px', borderRadius: '10px',
                      background: (lead.priority || 'normal') === p ? `${PRIORITY_COLORS[p]}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${(lead.priority || 'normal') === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.06)'}`,
                      color: (lead.priority || 'normal') === p ? PRIORITY_COLORS[p] : '#6b7280',
                      cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 700,
                      transition: 'all 0.15s',
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
