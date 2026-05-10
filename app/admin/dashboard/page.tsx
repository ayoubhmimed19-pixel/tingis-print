'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaSync, FaWhatsapp, FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import {
  Lead, KanbanColumn, KANBAN_COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS,
  Profile, ROLE_COLORS, getInitials, waLink,
} from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'
import { KanbanColumnSkeleton } from '@/components/admin/Skeleton'

type LeadWithProfile = Lead & { profiles?: Profile | null }

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({ lead, isDragging, onDragStart, onDragEnd }: {
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
        borderRadius: '12px', padding: '14px', cursor: 'grab',
        opacity: isDragging ? 0.6 : 1, transition: 'all 0.15s', userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <span style={{ fontWeight: 700, color: 'white', fontSize: '14px', lineHeight: 1.3, flex: 1 }}>
          {lead.name}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0,
          background: `${PRIORITY_COLORS[priority]}20`, color: PRIORITY_COLORS[priority],
          border: `1px solid ${PRIORITY_COLORS[priority]}40`,
        }}>
          {PRIORITY_LABELS[priority]}
        </span>
      </div>

      {/* Service */}
      <div style={{
        display: 'inline-block', background: 'rgba(22,169,234,0.1)', color: '#16a9ea',
        padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '8px',
      }}>
        {lead.service}
      </div>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {lead.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Phone */}
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', direction: 'ltr', textAlign: 'right' }}>
        {lead.phone}
      </div>

      {/* Price */}
      {lead.price > 0 && (
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '8px' }}>
          {lead.price.toLocaleString('ar-MA')} د.م
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#4b5563' }}>
          {new Date(lead.created_at).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {lead.profiles && (
            <div title={lead.profiles.name} style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: `${ROLE_COLORS[lead.profiles.role]}20`,
              border: `1px solid ${ROLE_COLORS[lead.profiles.role]}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: ROLE_COLORS[lead.profiles.role],
            }}>
              {getInitials(lead.profiles.name || lead.profiles.email)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '4px' }}>
            <a href={waLink(lead.phone, lead.name, lead.service)} target="_blank" rel="noopener noreferrer"
              draggable={false} onClick={e => e.stopPropagation()}
              style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', textDecoration: 'none', fontSize: '12px' }}>
              <FaWhatsapp />
            </a>
            <Link href={`/admin/leads/${lead.id}`} draggable={false} onClick={e => e.stopPropagation()}
              style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none', fontSize: '11px', fontWeight: 700 }}>
              ···
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Select ─────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: value ? 'rgba(22,169,234,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${value ? 'rgba(22,169,234,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '8px', padding: '6px 10px', color: value ? '#16a9ea' : '#9ca3af',
        fontSize: '12px', outline: 'none', fontFamily: 'Cairo, sans-serif', cursor: 'pointer',
        fontWeight: value ? 700 : 500,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads]           = useState<LeadWithProfile[]>([])
  const [team, setTeam]             = useState<Profile[]>([])
  const [loading, setLoading]       = useState(true)
  const [dragId, setDragId]         = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<KanbanColumn | null>(null)
  const [search, setSearch]         = useState('')
  const [userId, setUserId]         = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [filterService, setFilterService]   = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterTag, setFilterTag]           = useState('')

  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const [leadsRes, teamRes] = await Promise.all([
      supabase.from('leads')
        .select('*, profiles!leads_assigned_to_fkey(id, name, email, avatar_url, role)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('name'),
    ])
    if (leadsRes.error) { toast.error('خطأ في تحميل الطلبات') }
    setLeads((leadsRes.data || []) as LeadWithProfile[])
    if (teamRes.data) setTeam(teamRes.data as Profile[])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
    })
    fetchLeads()

    const channel = supabase.channel('leads-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        setLeads(prev => [payload.new as LeadWithProfile, ...prev])
        toast.info('📋 طلب جديد وصل!')
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, payload => {
        setLeads(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, payload => {
        setLeads(prev => prev.filter(l => l.id !== (payload.old as Lead).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router, fetchLeads])

  const handleDrop = async (col: KanbanColumn) => {
    if (!dragId) return
    const lead = leads.find(l => l.id === dragId)
    if (!lead || lead.kanban_column === col) { setDragId(null); setDragOverCol(null); return }
    setLeads(prev => prev.map(l => l.id === dragId ? { ...l, kanban_column: col } : l))
    const { error } = await supabase.from('leads').update({ kanban_column: col }).eq('id', dragId)
    if (error) { toast.error('فشل تحديث الحالة'); fetchLeads() }
    setDragId(null); setDragOverCol(null)
  }

  const clearFilters = () => { setFilterService(''); setFilterEmployee(''); setFilterPriority(''); setFilterTag('') }
  const activeFilterCount = [filterService, filterEmployee, filterPriority, filterTag].filter(Boolean).length

  // Derived filter options
  const services  = Array.from(new Set(leads.map(l => l.service))).sort()
  const allTags   = Array.from(new Set(leads.flatMap(l => l.tags || []))).sort()

  const filtered = leads.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search) && !l.service.includes(search)) return false
    if (filterService && l.service !== filterService) return false
    if (filterEmployee && l.assigned_to !== filterEmployee) return false
    if (filterPriority && (l.priority || 'normal') !== filterPriority) return false
    if (filterTag && !(l.tags || []).includes(filterTag)) return false
    return true
  })

  const totalRevenue = leads.reduce((s, l) => s + (l.price || 0), 0)
  const stats = {
    total:      leads.length,
    new:        leads.filter(l => (l.kanban_column || 'new') === 'new').length,
    inProgress: leads.filter(l => ['pending','design','printing'].includes(l.kanban_column || 'new')).length,
    done:       leads.filter(l => l.kanban_column === 'completed').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />

      <div style={{ flex: 1, marginRight: '220px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ position: 'relative', maxWidth: '300px', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '12px' }} />
              <input
                type="text" placeholder="بحث عن عميل، رقم، خدمة..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '8px 36px 8px 14px', color: 'white', fontSize: '13px',
                  outline: 'none', fontFamily: 'Cairo, sans-serif', textAlign: 'right', boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: showFilters || activeFilterCount > 0 ? 'rgba(22,169,234,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${showFilters || activeFilterCount > 0 ? 'rgba(22,169,234,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '8px 12px', color: activeFilterCount > 0 ? '#16a9ea' : '#9ca3af',
                cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '12px', fontWeight: 600, flexShrink: 0,
              }}
            >
              <FaFilter style={{ fontSize: '11px' }} />
              فلتر
              {activeFilterCount > 0 && (
                <span style={{ background: '#16a9ea', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
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

        {/* Filter Bar */}
        {showFilters && (
          <div style={{
            padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          }}>
            <FilterSelect
              value={filterService} onChange={setFilterService} placeholder="كل الخدمات"
              options={services.map(s => ({ label: s, value: s }))}
            />
            <FilterSelect
              value={filterEmployee} onChange={setFilterEmployee} placeholder="كل الموظفين"
              options={team.map(t => ({ label: t.name || t.email, value: t.id }))}
            />
            <FilterSelect
              value={filterPriority} onChange={setFilterPriority} placeholder="كل الأولويات"
              options={[
                { label: 'منخفض', value: 'low' },
                { label: 'عادي', value: 'normal' },
                { label: 'عالي', value: 'high' },
                { label: 'عاجل', value: 'urgent' },
              ]}
            />
            {allTags.length > 0 && (
              <FilterSelect
                value={filterTag} onChange={setFilterTag} placeholder="كل التصنيفات"
                options={allTags.map(t => ({ label: t, value: t }))}
              />
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '6px 10px', color: '#f87171',
                cursor: 'pointer', fontSize: '12px', fontFamily: 'Cairo, sans-serif', fontWeight: 600,
              }}>
                <FaTimes style={{ fontSize: '10px' }} />
                مسح الكل
              </button>
            )}
            <span style={{ fontSize: '12px', color: '#4b5563', marginRight: 'auto' }}>
              {filtered.length} طلب
            </span>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '10px', padding: '14px 24px 0', flexWrap: 'wrap' }}>
          {[
            { label: 'إجمالي',      value: stats.total,      color: '#16a9ea', suffix: '' },
            { label: 'جديد',        value: stats.new,        color: '#3b82f6', suffix: '' },
            { label: 'قيد التنفيذ', value: stats.inProgress, color: '#f59e0b', suffix: '' },
            { label: 'مكتمل',       value: stats.done,       color: '#22c55e', suffix: '' },
            { label: 'الإيرادات',   value: totalRevenue > 0 ? `${totalRevenue.toLocaleString('ar-MA')} د.م` : '—', color: '#8b5cf6', suffix: '' },
          ].map((s, i) => (
            <div key={i} style={{
              background: `${s.color}10`, border: `1px solid ${s.color}20`,
              borderRadius: '12px', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: typeof s.value === 'string' && s.value.length > 4 ? '14px' : '20px', fontWeight: 900, color: s.color }}>
                {s.value}
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div style={{ display: 'flex', gap: '14px', padding: '16px 24px 24px', overflowX: 'auto', flex: 1, alignItems: 'flex-start' }}>
            {KANBAN_COLUMNS.map(col => <KanbanColumnSkeleton key={col.id} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '14px', padding: '16px 24px 24px', overflowX: 'auto', flex: 1, alignItems: 'flex-start' }}>
            {KANBAN_COLUMNS.map(col => {
              const colLeads = filtered.filter(l => (l.kanban_column || 'new') === col.id)
              const isOver   = dragOverCol === col.id
              return (
                <div
                  key={col.id}
                  onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null) }}
                  onDrop={e => { e.preventDefault(); handleDrop(col.id) }}
                  style={{
                    minWidth: '260px', width: '260px',
                    background: isOver ? col.bg : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isOver ? col.color : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '16px', padding: '14px', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 210px)',
                  }}
                >
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '13px', flex: 1 }}>{col.label}</span>
                    <span style={{ background: `${col.color}20`, color: col.color, padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                    {colLeads.length === 0 ? (
                      <div style={{ border: `2px dashed ${col.color}30`, borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '12px' }}>
                        أفلت بطاقة هنا
                      </div>
                    ) : colLeads.map(lead => (
                      <KanbanCard
                        key={lead.id} lead={lead}
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

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @media (max-width: 768px) {
          div[style*="margin-right: 220px"] { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  )
}
