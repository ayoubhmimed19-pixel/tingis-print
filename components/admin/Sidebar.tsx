'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaTachometerAlt, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaComments, FaAddressBook, FaChartBar, FaCalendarAlt } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'
import { Profile, ROLE_LABELS, ROLE_COLORS, getInitials } from '@/lib/supabase'

const NAV = [
  { href: '/admin/dashboard',  icon: FaTachometerAlt, label: 'الكانبان'   },
  { href: '/admin/analytics',  icon: FaChartBar,      label: 'الإحصائيات' },
  { href: '/admin/calendar',   icon: FaCalendarAlt,   label: 'التقويم'    },
  { href: '/admin/chat',       icon: FaComments,      label: 'الشات'      },
  { href: '/admin/clients',    icon: FaAddressBook,   label: 'العملاء'    },
  { href: '/admin/team',       icon: FaUsers,         label: 'الفريق'     },
]

export default function Sidebar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
    router.refresh()
  }

  const sidebarContent = (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#0d0d0d',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/logo-v2.png" alt="Tingis Print" width={100} height={36}
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <button onClick={() => setOpen(false)}
            className="sidebar-close-btn"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', padding: '6px 8px', display: 'none' }}>
            <FaTimes />
          </button>
        </div>
        <span style={{
          display: 'inline-block', marginTop: '8px',
          background: 'rgba(22,169,234,0.1)', border: '1px solid rgba(22,169,234,0.2)',
          color: '#16a9ea', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
        }}>CRM</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
              background: active ? 'rgba(22,169,234,0.12)' : 'transparent',
              color: active ? '#16a9ea' : '#9ca3af',
              fontWeight: active ? 700 : 500, fontSize: '14px',
              transition: 'all 0.15s',
            }}>
              <item.icon style={{ fontSize: '15px', flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `${ROLE_COLORS[profile.role]}30`,
              border: `1px solid ${ROLE_COLORS[profile.role]}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: ROLE_COLORS[profile.role],
              flexShrink: 0,
            }}>
              {getInitials(profile.name || profile.email)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.name || profile.email}
              </div>
              <div style={{ fontSize: '11px', color: ROLE_COLORS[profile.role], fontWeight: 600 }}>
                {ROLE_LABELS[profile.role]}
              </div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)', color: '#f87171',
          cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '13px', fontWeight: 700,
        }}>
          <FaSignOutAlt style={{ fontSize: '13px' }} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle — only when sidebar is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="sidebar-toggle"
          style={{
            position: 'fixed', top: '14px', right: '14px', zIndex: 50,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '8px 10px', color: 'white', cursor: 'pointer',
            display: 'none',
          }}
        >
          <FaBars />
        </button>
      )}

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 39,
            backdropFilter: 'blur(2px)',
          }} />
          {sidebarContent}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-toggle    { display: flex !important; }
          .sidebar-desktop   { display: none; }
          .sidebar-close-btn { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </>
  )
}
