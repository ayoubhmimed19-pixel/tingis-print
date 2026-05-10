'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Lead, KANBAN_COLUMNS, Profile, ROLE_COLORS, getInitials } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

// ─── Chart Components ─────────────────────────────────────────────────────────

function BarChart({ data, color = '#16a9ea' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          {d.value > 0 && <span style={{ fontSize: '11px', color, fontWeight: 700 }}>{d.value}</span>}
          <div style={{
            width: '100%', background: `linear-gradient(180deg, ${color}, ${color}aa)`,
            borderRadius: '6px 6px 0 0',
            height: `${Math.max((d.value / max) * 100, d.value > 0 ? 6 : 0)}%`,
            transition: 'height 0.6s ease', minHeight: d.value > 0 ? '6px' : '0',
          }} />
          <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let offset = 0
  const r = 40, cx = 50, cy = 50, stroke = 14
  const circumference = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg width="100" height="100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {data.map((d, i) => {
          const pct = d.value / total
          const dashArray = `${pct * circumference} ${circumference}`
          const dashOffset = -offset * circumference
          offset += pct
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={dashArray} strokeDashoffset={dashOffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 0.5s' }}
            />
          )
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="700">{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {data.slice(0, 6).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Analytics Page ───────────────────────────────────────────────────────────

const CHART_COLORS = ['#16a9ea', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

export default function AnalyticsPage() {
  const router = useRouter()
  const [leads, setLeads]     = useState<Lead[]>([])
  const [team, setTeam]       = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)

      const [leadsRes, teamRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('*'),
      ])
      if (leadsRes.data) setLeads(leadsRes.data as Lead[])
      if (teamRes.data) setTeam(teamRes.data as Profile[])
      setLoading(false)
    })
  }, [router])

  // ── Computed stats ──────────────────────────────────────────────────────────

  const total      = leads.length
  const completed  = leads.filter(l => l.kanban_column === 'completed').length
  const thisMonth  = leads.filter(l => {
    const d = new Date(l.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Orders per month (last 7 months)
  const monthlyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (6 - i))
    const count = leads.filter(l => {
      const ld = new Date(l.created_at)
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear()
    }).length
    return {
      label: d.toLocaleDateString('ar-MA', { month: 'short' }),
      value: count,
    }
  })

  // Orders by service
  const serviceMap = new Map<string, number>()
  leads.forEach(l => serviceMap.set(l.service, (serviceMap.get(l.service) || 0) + 1))
  const serviceData = Array.from(serviceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: CHART_COLORS[i % CHART_COLORS.length] }))

  // Orders by kanban column
  const kanbanData = KANBAN_COLUMNS.map(col => ({
    label: col.label,
    value: leads.filter(l => (l.kanban_column || 'new') === col.id).length,
    color: col.color,
  }))

  // Employee performance
  const empMap = new Map<string, number>()
  leads.forEach(l => {
    if (l.assigned_to) empMap.set(l.assigned_to, (empMap.get(l.assigned_to) || 0) + 1)
  })
  const empData = Array.from(empMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ profile: team.find(t => t.id === id), count }))
    .filter(e => e.profile)

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginRight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }

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
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>الإحصائيات</h1>
          {userId && <NotificationBell userId={userId} />}
        </header>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {[
              { label: 'إجمالي الطلبات', value: total,           color: '#16a9ea', suffix: '' },
              { label: 'هذا الشهر',      value: thisMonth,       color: '#8b5cf6', suffix: '' },
              { label: 'مكتملة',         value: completed,       color: '#22c55e', suffix: '' },
              { label: 'معدل الإنجاز',   value: conversionRate,  color: '#f59e0b', suffix: '%' },
            ].map((s, i) => (
              <div key={i} style={{ background: `${s.color}10`, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: s.color }}>{s.value}{s.suffix}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Monthly + Service */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div style={card}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'white' }}>الطلبات الشهرية</h3>
              <BarChart data={monthlyData} />
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'white' }}>توزيع الخدمات</h3>
              <DonutChart data={serviceData} />
            </div>
          </div>

          {/* Kanban distribution */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'white' }}>توزيع المراحل</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {kanbanData.map(col => (
                <div key={col.label} style={{ flex: 1, minWidth: '100px', background: `${col.color}10`, border: `1px solid ${col.color}20`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: col.color }}>{col.value}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{col.label}</div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${Math.round((col.value / (total || 1)) * 100)}%`, background: col.color, borderRadius: '2px' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>{Math.round((col.value / (total || 1)) * 100)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Performance */}
          {empData.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'white' }}>أداء الفريق</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {empData.map(({ profile, count }, i) => (
                  profile && (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: `${ROLE_COLORS[profile.role]}20`, border: `1px solid ${ROLE_COLORS[profile.role]}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: ROLE_COLORS[profile.role],
                      }}>
                        {getInitials(profile.name || profile.email)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{profile.name || profile.email}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a9ea' }}>{count} طلب</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                          <div style={{ height: '100%', width: `${Math.round((count / (empData[0].count || 1)) * 100)}%`, background: 'linear-gradient(90deg, #16a9ea, #8b5cf6)', borderRadius: '3px', transition: 'width 0.6s' }} />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="margin-right: 220px"] { margin-right: 0 !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
