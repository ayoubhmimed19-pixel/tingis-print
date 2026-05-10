'use client'

import { useEffect, useRef, useState } from 'react'
import { FaBell, FaCircle } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'
import { Notification, formatDate } from '@/lib/supabase'

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const supabase = createClient()

    supabase.from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setNotifications(data as Notification[]) })

    const channel = supabase.channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true })
      .eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const typeIcon: Record<string, string> = {
    new_order: '📋', assigned: '👤', status_changed: '🔄', mention: '@',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
          padding: '8px 10px', color: '#9ca3af', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <FaBell style={{ fontSize: '16px' }} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', left: '-4px',
            background: '#ef4444', color: 'white', borderRadius: '999px',
            fontSize: '10px', fontWeight: 700, minWidth: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          width: '320px', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 100, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
              الإشعارات {unread > 0 && <span style={{ color: '#ef4444' }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', color: '#16a9ea',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 600,
              }}>
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                لا توجد إشعارات
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                display: 'flex', gap: '12px', padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: n.read ? 'transparent' : 'rgba(22,169,234,0.05)',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                }}>
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{n.title}</span>
                    {!n.read && <FaCircle style={{ fontSize: '6px', color: '#16a9ea', flexShrink: 0 }} />}
                  </div>
                  {n.body && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{n.body}</p>}
                  <span style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px', display: 'block' }}>
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
