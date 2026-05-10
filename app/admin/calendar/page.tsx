'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'
import { Lead, KANBAN_COLUMNS } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

export default function CalendarPage() {
  const router = useRouter()
  const [leads, setLeads]         = useState<Lead[]>([])
  const [loading, setLoading]     = useState(true)
  const [userId, setUserId]       = useState<string | null>(null)
  const [today]                   = useState(new Date())
  const [viewDate, setViewDate]   = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('leads').select('*')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true })
      if (data) setLeads(data as Lead[])
      setLoading(false)
    })
  }, [router])

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()   // 0=Sun
  const daysInMonth    = new Date(year, month + 1, 0).getDate()

  const monthLeads = leads.filter(l => {
    if (!l.deadline) return false
    const d = new Date(l.deadline)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const getLeadsForDay = (day: number) =>
    monthLeads.filter(l => new Date(l.deadline!).getDate() === day)

  const colColor = (col: string) =>
    KANBAN_COLUMNS.find(c => c.id === col)?.color || '#6b7280'

  const prevMonth = () => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); setSelectedDay(null) }
  const nextMonth = () => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); setSelectedDay(null) }

  const monthName = viewDate.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })
  const dayNames  = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedLeads = selectedDay ? getLeadsForDay(selectedDay) : []

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginRight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

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
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>التقويم</h1>
          {userId && <NotificationBell userId={userId} />}
        </header>

        <div style={{ padding: '24px', maxWidth: '960px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Calendar Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer' }}>
                <FaChevronRight />
              </button>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>{monthName}</h2>
              <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer' }}>
                <FaChevronLeft />
              </button>
            </div>

            {/* Day names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {dayNames.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#6b7280', padding: '6px 0' }}>{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {cells.map((day, i) => {
                if (day === null) return <div key={i} style={{ minHeight: '70px' }} />
                const dayLeads   = getLeadsForDay(day)
                const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSelected = day === selectedDay
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{
                      minHeight: '70px', borderRadius: '10px', padding: '6px',
                      background: isSelected ? 'rgba(22,169,234,0.14)' : isToday ? 'rgba(22,169,234,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? '#16a9ea50' : isToday ? '#16a9ea30' : 'rgba(255,255,255,0.05)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: isToday ? 900 : 600, color: isToday ? '#16a9ea' : '#9ca3af', marginBottom: '3px' }}>{day}</div>
                    {dayLeads.slice(0, 3).map((l, j) => (
                      <div key={j} style={{
                        fontSize: '10px', color: colColor(l.kanban_column || 'new'),
                        background: `${colColor(l.kanban_column || 'new')}18`,
                        borderRadius: '4px', padding: '1px 4px', marginBottom: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {l.name}
                      </div>
                    ))}
                    {dayLeads.length > 3 && (
                      <div style={{ fontSize: '9px', color: '#6b7280' }}>+{dayLeads.length - 3}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay !== null && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: 'white' }}>
                يوم {selectedDay} {viewDate.toLocaleDateString('ar-MA', { month: 'long' })}
                <span style={{ marginRight: '8px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>({selectedLeads.length} طلبات)</span>
              </h3>
              {selectedLeads.length === 0 ? (
                <p style={{ color: '#4b5563', textAlign: 'center', padding: '20px 0', margin: 0 }}>لا توجد طلبات في هذا اليوم</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedLeads.map(l => {
                    const col = KANBAN_COLUMNS.find(c => c.id === (l.kanban_column || 'new'))
                    return (
                      <Link key={l.id} href={`/admin/leads/${l.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px', padding: '12px 16px', transition: 'border-color 0.15s',
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col?.color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{l.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{l.service}</div>
                          </div>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${col?.color}20`, color: col?.color, flexShrink: 0 }}>
                            {col?.label}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* This month's deadlines */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: 'white' }}>مواعيد التسليم هذا الشهر</h3>
            {monthLeads.length === 0 ? (
              <p style={{ color: '#4b5563', textAlign: 'center', padding: '20px 0', margin: 0 }}>لا توجد طلبات بمواعيد تسليم هذا الشهر</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {monthLeads.map(l => {
                  const col      = KANBAN_COLUMNS.find(c => c.id === (l.kanban_column || 'new'))
                  const deadline  = new Date(l.deadline!)
                  const isPast    = deadline < today && l.kanban_column !== 'completed'
                  return (
                    <Link key={l.id} href={`/admin/leads/${l.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isPast ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px', padding: '12px 16px',
                      }}>
                        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '36px' }}>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: isPast ? '#ef4444' : '#f59e0b', lineHeight: 1 }}>
                            {deadline.getDate()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            {deadline.toLocaleDateString('ar-MA', { month: 'short' })}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{l.service}</div>
                        </div>
                        {isPast && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>متأخر</span>}
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: `${col?.color}20`, color: col?.color, flexShrink: 0 }}>
                          {col?.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="margin-right: 220px"] { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  )
}
