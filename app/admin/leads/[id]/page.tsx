'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowRight, FaWhatsapp, FaUser, FaTrash, FaClock } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import {
  Lead, OrderActivity, Profile, KANBAN_COLUMNS, PRIORITY_LABELS, PRIORITY_COLORS,
  ROLE_LABELS, ROLE_COLORS, waLink, formatDate, getInitials,
} from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

type LeadWithProfile = Lead & { profiles?: Profile | null }

const ACTIVITY_ICONS: Record<string, string> = {
  created: '🆕', status_changed: '🔄', assigned: '👤',
  note_added: '📝', contacted: '📞', completed: '✅', column_moved: '📦',
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead]           = useState<LeadWithProfile | null>(null)
  const [activities, setActivities] = useState<OrderActivity[]>([])
  const [team, setTeam]           = useState<Profile[]>([])
  const [note, setNote]           = useState('')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [userName, setUserName]   = useState('')

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const [leadRes, activitiesRes, teamRes] = await Promise.all([
      supabase.from('leads').select('*, profiles!leads_assigned_to_fkey(*)').eq('id', id).single(),
      supabase.from('order_activities').select('*, profiles!order_activities_user_id_fkey(id, name, avatar_url)').eq('lead_id', id).order('created_at', { ascending: true }),
      supabase.from('profiles').select('*').order('name'),
    ])

    if (leadRes.data) setLead(leadRes.data as LeadWithProfile)
    if (activitiesRes.data) setActivities(activitiesRes.data as OrderActivity[])
    if (teamRes.data) setTeam(teamRes.data as Profile[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
      supabase.from('profiles').select('name').eq('id', user.id).single()
        .then(({ data }) => { if (data) setUserName(data.name) })
    })
    fetchData()
  }, [router, fetchData])

  const addActivity = async (type: OrderActivity['type'], content: string, meta = {}) => {
    if (!userId) return
    await supabase.from('order_activities').insert({
      lead_id: id, user_id: userId, type, content, metadata: meta,
    })
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

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف طلب "${lead?.name}"؟`)) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { toast.error('فشل الحذف'); return }
    toast.success('تم الحذف')
    router.push('/admin/dashboard')
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
            <Link href="/admin/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#9ca3af', textDecoration: 'none', fontSize: '13px',
            }}>
              <FaArrowRight />
              العودة
            </Link>
            <span style={{ color: '#374151' }}>/</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{lead.name}</span>
            <span style={{
              padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
              background: `${col?.color}20`, color: col?.color,
              border: `1px solid ${col?.color}40`,
            }}>
              {col?.label}
            </span>
          </div>
          {userId && <NotificationBell userId={userId} />}
        </header>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

          {/* Left: Timeline + Note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Client Info Card */}
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
              {lead.message && (
                <p style={{
                  marginTop: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                  padding: '12px', color: '#9ca3af', fontSize: '13px', lineHeight: 1.6,
                }}>
                  {lead.message}
                </p>
              )}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={waLink(lead.phone, lead.name, lead.service)} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#22c55e', color: 'white', padding: '8px 16px',
                    borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  }}>
                  <FaWhatsapp />
                  تواصل عبر واتساب
                </a>
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

            {/* Activity Timeline */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock style={{ color: '#16a9ea', fontSize: '14px' }} />
                سجل النشاط
              </h3>

              {activities.length === 0 ? (
                <p style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>لا يوجد نشاط بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {activities.map((act, i) => (
                    <div key={act.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      {/* Line */}
                      {i < activities.length - 1 && (
                        <div style={{ position: 'absolute', right: '15px', top: '30px', bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                      )}
                      {/* Icon */}
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                        position: 'relative', zIndex: 1,
                      }}>
                        {ACTIVITY_ICONS[act.type] || '📌'}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#e5e7eb', fontWeight: 600 }}>{act.content}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          {act.profiles && (
                            <span style={{ fontSize: '11px', color: '#16a9ea', fontWeight: 600 }}>
                              {act.profiles.name}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: '#4b5563' }}>{formatDate(act.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note */}
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

          {/* Right: Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Assign */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUser style={{ fontSize: '12px' }} />
                تعيين إلى
              </h4>
              <select
                value={lead.assigned_to || ''}
                onChange={e => handleAssign(e.target.value || null)}
                style={{
                  width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '13px',
                  outline: 'none', fontFamily: 'Cairo, sans-serif', cursor: 'pointer',
                }}
              >
                <option value="">— غير معيّن —</option>
                {team.map(t => (
                  <option key={t.id} value={t.id}>{t.name || t.email} ({ROLE_LABELS[t.role]})</option>
                ))}
              </select>
              {lead.profiles && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: `${ROLE_COLORS[lead.profiles.role]}20`,
                    border: `1px solid ${ROLE_COLORS[lead.profiles.role]}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: ROLE_COLORS[lead.profiles.role],
                  }}>
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
