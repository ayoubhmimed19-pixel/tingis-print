'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaWhatsapp, FaSearch } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'
import { Lead, getInitials, waLink } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

type Client = {
  phone: string
  name: string
  services: string[]
  totalOrders: number
  lastOrder: string
  latestLead: Lead
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [userId, setUserId]   = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (!data) { setLoading(false); return }

      // Group by phone
      const map = new Map<string, Lead[]>()
      ;(data as Lead[]).forEach(lead => {
        const phone = lead.phone.replace(/\D/g, '')
        if (!map.has(phone)) map.set(phone, [])
        map.get(phone)!.push(lead)
      })

      const clientList: Client[] = Array.from(map.entries()).map(([phone, leads]) => ({
        phone,
        name: leads[0].name,
        services: Array.from(new Set(leads.map(l => l.service))),
        totalOrders: leads.length,
        lastOrder: leads[0].created_at,
        latestLead: leads[0],
      }))

      clientList.sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime())
      setClients(clientList)
      setLoading(false)
    })
  }, [router])

  const filtered = clients.filter(c =>
    !search ||
    c.name.includes(search) ||
    c.phone.includes(search) ||
    c.services.some(s => s.includes(search))
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
              العملاء
            </h1>
            <div style={{ position: 'relative', maxWidth: '300px', flex: 1 }}>
              <FaSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '12px' }} />
              <input
                type="text"
                placeholder="بحث..."
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
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{filtered.length} عميل</span>
            {userId && <NotificationBell userId={userId} />}
          </div>
        </header>

        <div style={{ padding: '24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              جارٍ التحميل...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              لا يوجد عملاء بعد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map(client => (
                <Link
                  key={client.phone}
                  href={`/admin/clients/${encodeURIComponent(client.phone)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(22,169,234,0.15)', border: '1px solid rgba(22,169,234,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700, color: '#16a9ea',
                    }}>
                      {getInitials(client.name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '15px', marginBottom: '4px' }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', direction: 'ltr', display: 'inline-block' }}>
                        {client.phone}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {client.services.slice(0, 3).map(s => (
                          <span key={s} style={{
                            background: 'rgba(22,169,234,0.1)', color: '#16a9ea',
                            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a9ea' }}>{client.totalOrders}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>طلبات</div>
                    </div>

                    {/* WhatsApp */}
                    <a
                      href={waLink(client.phone, client.name, client.services[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#22c55e', textDecoration: 'none', fontSize: '16px',
                      }}
                    >
                      <FaWhatsapp />
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
