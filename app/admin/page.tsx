'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('البريد الإلكتروني أو كلمة السر غير صحيحة')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '40px 32px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/logo-v2.png" alt="Tingis Print" width={140} height={50}
            style={{ height: '48px', width: 'auto', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(22,169,234,0.1)', border: '1px solid rgba(22,169,234,0.2)',
            color: '#16a9ea', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
          }}>
            <FaLock style={{ fontSize: '11px' }} />
            لوحة التحكم
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' }}>
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="admin@tingisprint.com"
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px 48px 12px 16px', color: 'white', fontSize: '15px',
                  outline: 'none', boxSizing: 'border-box', textAlign: 'right', fontFamily: 'Cairo, sans-serif',
                }}
              />
              <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' }}>
              كلمة السر
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '12px 48px 12px 16px', color: 'white', fontSize: '15px',
                  outline: 'none', boxSizing: 'border-box', textAlign: 'right', fontFamily: 'Cairo, sans-serif',
                }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" disabled={loading || !email || !password} style={{
            background: loading ? '#0b86c7' : '#16a9ea', color: 'white', border: 'none',
            borderRadius: '14px', padding: '14px', fontWeight: 900, fontSize: '16px',
            cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            opacity: !email || !password ? 0.6 : 1,
            transition: 'all 0.2s', fontFamily: 'Cairo, sans-serif',
          }}>
            {loading ? 'جارٍ التحقق...' : 'دخول'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px', marginTop: '24px' }}>
          Tingis Print CRM © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
