'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaSync, FaWhatsapp, FaSearch, FaPlus } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import {
  Lead, KanbanColumn, KANBAN_COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS,
  Profile, getInitials, waLink,
} from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

// ─── Types ───────────────────────────────────────────────────────────────────

type LeadWithProfile = Lead & { profiles?: Profile | null }

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function KanbanCard({
  lead, isDragging, onDragStart, onDragEnd,
}: {
  lead: LeadWithProfile
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const priority = lead.priority || 'normal'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: isDragging ? 'rgba(22,169,234,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDragging ? '#16a9ea' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px',
        padding: '14px',
        cursor: 'grab',
        opacity: isDragging ? 0.6 : 1,
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
        <span style={{ fontWeight: 700, color: 'white', fontSize: '14px', lineHeight: 1.3, flex: 1 }}>
          {lead.name}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0,
          background: `${PRIORITY_COLORS[priority]}20`,
          color: PRIORITY_COLORS[priority],
          border: `1px solid ${PRIORITY_COLORS[priority]}40`,
        }}>
          {PRIORITY_LABELS[priority]}
        </span>
      </div>

      {/* Service */}
      <div style={{
        display: 'inline-block', background: 'rgba(22,169,234,0.1)', color: '#16a9ea',
        padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '10px',
      }}>
        {lead.service}
      </div>

      {/* Phone */}
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px', direction: 'ltr', textAlign: 'right' }}>
        {lead.phone}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#4b5563' }}>
          {new Date(lead.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {lead.profiles && (
            <div title={lead.profiles.name} style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: '#8b5cf6',
            }}>
              {getInitials(lead.profiles.name || lead.profiles.email)}
            </div>
          )}

          <div style={{ display: 'flex', gap: '4px' }}>
            <a
              href={waLink(lead.phone, lead.name, lead.service)}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onClick={e => e.stopPropagation()}
              style={{
                width: '26px', height: '26px', borderRadius: '8px',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#22c55e', textDecoration: 'none', fontSize: '12px',
              }}
            >
              <FaWhatsapp />
            </a>
            <Link
              href={`/admin/leads/${lead.id}`}
              draggable={false}
              onClick={e => e.stopPropagation()}
              style={{
                width: '26px', height: '26px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#9ca3af', textDecoration: 'none', fontSize: '11px', fontWeight: 700,
              }}
            >
              ···
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads]           = useState<LeadWithProfile[]>([])
  const [loading, setLoading]       = useState(true)
  const [dragId, setDragId]         = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<KanbanColumn | null>(null)
  const [search, setSearch]         = useState('')
  const [userId, setUserId]         = useState<string | null>(null)

  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*, profiles!leads_assigned_to_fkey(id, name, email, avatar_url, role)')
      .order('created_at', { ascending: false })

    if (error) { toast.error('خطأ في تحميل الطلبات'); setLoading(false); return }
    setLeads((data || []) as LeadWithProfile[])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
    })

    fetchLeads()

    const channel = supabase.channel('leads-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new as LeadWithProfile, ...prev])
        toast.info('📋 طلب جديد وصل!')
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => prev.filter(l => l.id !== (payload.old as Lead).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router, fetchLeads])

  const handleDrop = async (col: KanbanColumn) => {
    if (!dragId || dragId === null) return
    const lead = leads.find(l => l.id === dragId)
    if (!lead || lead.kanban_column === col) { setDragId(null); setDragOverCol(null); return }

    setLeads(prev => prev.map(l => l.id === dragId ? { ...l, kanban_column: col } : l))
    const { error } = await supabase.from('leads').update({ kanban_column: col }).eq('id', dragId)
    if (error) {
      toast.error('فشل تحديث الحالة')
      fetchLeads()
    }
    setDragId(null)
    setDragOverCol(null)
  }

  const filtered = leads.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.service.includes(search)
  )

  const stats = {
    total: leads.length,
    new: leads.filter(l => (l.kanban_column || 'new') === 'new').length,
    inProgress: leads.filter(l => ['pending','design','printing'].includes(l.kanban_column || 'new')).length,
    done: leads.filter(l => l.kanban_column === 'completed').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, marginRight: '220px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ position: 'relative', maxWidth: '320px', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '12px' }} />
              <input
                type="text"
                placeholder="بحث عن عميل، رقم، خدمة..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '8px 36px 8px 14px', color: 'white', fontSize: '13px',
                  outline: 'none', fontFamily: 'Cairo, sans-serif', textAlign: 'right', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={fetchLeads} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px 12px', color: '#9ca3af', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'Cairo, sans-serif',
            }}>
              <FaSync style={{ fontSize: '12px' }} />
              تحديث
            </button>
            {userId && <NotificationBell userId={userId} />}
          </div>
        </header>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px 24px 0', flexWrap: 'wrap' }}>
          {[
            { label: 'إجمالي',      value: stats.total,      color: '#16a9ea' },
            { label: 'جديد',        value: stats.new,        color: '#3b82f6' },
            { label: 'قيد التنفيذ', value: stats.inProgress, color: '#f59e0b' },
            { label: 'مكتمل',       value: stats.done,       color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{
              background: `${s.color}10`, border: `1px solid ${s.color}20`,
              borderRadius: '12px', padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b7280', fontWeight: 600 }}>جارٍ تحميل الطلبات...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: '14px', padding: '16px 24px 24px',
            overflowX: 'auto', flex: 1, alignItems: 'flex-start',
          }}>
            {KANBAN_COLUMNS.map(col => {
              const colLeads = filtered.filter(l => (l.kanban_column || 'new') === col.id)
              const isOver = dragOverCol === col.id

              return (
                <div
                  key={col.id}
                  onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
                  onDragLeave={e => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null)
                  }}
                  onDrop={e => { e.preventDefault(); handleDrop(col.id) }}
                  style={{
                    minWidth: '260px',
                    width: '260px',
                    background: isOver ? col.bg : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isOver ? col.color : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '16px',
                    padding: '14px',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 200px)',
                  }}
                >
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '13px', flex: 1 }}>
                      {col.label}
                    </span>
                    <span style={{
                      background: `${col.color}20`, color: col.color,
                      padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                    }}>
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                    {colLeads.length === 0 ? (
                      <div style={{
                        border: `2px dashed ${col.color}30`, borderRadius: '10px',
                        padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '12px',
                      }}>
                        أفلت بطاقة هنا
                      </div>
                    ) : colLeads.map(lead => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        isDragging={dragId === lead.id}
                        onDragStart={() => setDragId(lead.id)}
                        onDragEnd={() => { setDragId(null); setDragOverCol(null) }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile margin fix */}
      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  )
}
