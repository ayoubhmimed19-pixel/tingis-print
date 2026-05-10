'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaUserPlus, FaEnvelope } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import {
  Profile, UserRole, ROLE_LABELS, ROLE_COLORS, getInitials, formatDate,
} from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

export default function TeamPage() {
  const router = useRouter()
  const [team, setTeam]         = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [userId, setUserId]     = useState<string | null>(null)
  const [myRole, setMyRole]     = useState<UserRole | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')
  const [inviting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) setMyRole(profile.role as UserRole)

      const { data: teamData } = await supabase.from('profiles').select('*').order('created_at')
      if (teamData) setTeam(teamData as Profile[])
      setLoading(false)
    })
  }, [router])

  const handleChangeRole = async (profileId: string, role: UserRole) => {
    if (myRole !== 'owner') { toast.error('فقط المالك يمكنه تغيير الأدوار'); return }
    const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
    if (error) { toast.error('فشل تغيير الدور'); return }
    setTeam(prev => prev.map(t => t.id === profileId ? { ...t, role } : t))
    toast.success('تم تحديث الدور')
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info(`لإضافة ${inviteEmail}: اذهب إلى Supabase → Authentication → Invite User`, { duration: 6000 })
    setInviteEmail('')
    setShowInvite(false)
  }

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
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>الفريق</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {myRole === 'owner' && (
              <button onClick={() => setShowInvite(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#16a9ea', color: 'white', border: 'none',
                borderRadius: '10px', padding: '8px 14px', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              }}>
                <FaUserPlus style={{ fontSize: '12px' }} />
                إضافة عضو
              </button>
            )}
            {userId && <NotificationBell userId={userId} />}
          </div>
        </header>

        <div style={{ padding: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>

          {/* Invite Modal */}
          {showInvite && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '24px', marginBottom: '24px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: 'white' }}>
                دعوة عضو جديد
              </h3>
              <div style={{
                background: 'rgba(22,169,234,0.08)', border: '1px solid rgba(22,169,234,0.2)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                fontSize: '12px', color: '#7dd3fc', lineHeight: 1.6,
              }}>
                💡 للدعوة: اذهب إلى <strong>Supabase Dashboard → Authentication → Users → Invite User</strong>، ثم أدخل البريد الإلكتروني. سيظهر العضو تلقائياً هنا عند أول تسجيل دخول.
              </div>
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', padding: '10px 14px 10px 40px', color: 'white', fontSize: '13px',
                      outline: 'none', fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  style={{
                    background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '13px',
                    outline: 'none', fontFamily: 'Cairo, sans-serif', cursor: 'pointer',
                  }}
                >
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                </select>
                <button type="submit" disabled={inviting} style={{
                  background: '#16a9ea', color: 'white', border: 'none', borderRadius: '10px',
                  padding: '10px 18px', fontWeight: 700, fontSize: '13px',
                  cursor: inviting ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif',
                }}>
                  {inviting ? '...' : 'إرسال'}
                </button>
                <button type="button" onClick={() => setShowInvite(false)} style={{
                  background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                }}>
                  إلغاء
                </button>
              </form>
            </div>
          )}

          {/* Team List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(22,169,234,0.2)', borderTopColor: '#16a9ea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              جارٍ التحميل...
            </div>
          ) : team.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#6b7280',
            }}>
              لا يوجد أعضاء في الفريق بعد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {team.map(member => (
                <div key={member.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'border-color 0.15s',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: `${ROLE_COLORS[member.role]}20`,
                    border: `2px solid ${ROLE_COLORS[member.role]}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 700, color: ROLE_COLORS[member.role],
                  }}>
                    {getInitials(member.name || member.email)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '14px', marginBottom: '2px' }}>
                      {member.name || '—'}
                      {member.id === userId && (
                        <span style={{ marginRight: '8px', fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                          (أنت)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.email}</div>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                      آخر نشاط: {formatDate(member.last_active || member.created_at)}
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    {myRole === 'owner' && member.id !== userId ? (
                      <select
                        value={member.role}
                        onChange={e => handleChangeRole(member.id, e.target.value as UserRole)}
                        style={{
                          background: `${ROLE_COLORS[member.role]}15`,
                          border: `1px solid ${ROLE_COLORS[member.role]}40`,
                          color: ROLE_COLORS[member.role],
                          borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 700,
                          outline: 'none', fontFamily: 'Cairo, sans-serif', cursor: 'pointer',
                        }}
                      >
                        <option value="owner">المالك</option>
                        <option value="manager">مدير</option>
                        <option value="employee">موظف</option>
                      </select>
                    ) : (
                      <span style={{
                        padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                        background: `${ROLE_COLORS[member.role]}15`,
                        color: ROLE_COLORS[member.role],
                        border: `1px solid ${ROLE_COLORS[member.role]}30`,
                      }}>
                        {ROLE_LABELS[member.role]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
