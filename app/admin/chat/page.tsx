'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FaPaperPlane, FaMicrophone, FaStop, FaPlay, FaPause, FaAt, FaPaperclip, FaFileAlt, FaDownload } from 'react-icons/fa'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-browser'
import { Profile, getInitials, ROLE_COLORS } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import NotificationBell from '@/components/admin/NotificationBell'

type Message = {
  id: string
  user_id: string
  content: string | null
  audio_url: string | null
  file_url: string | null
  file_name: string | null
  mentions: string[]
  created_at: string
  profiles?: Pick<Profile, 'id' | 'name' | 'email' | 'avatar_url' | 'role'> | null
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause() } else { audioRef.current.play() }
    setPlaying(!playing)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '8px 14px', minWidth: '200px' }}>
      <audio ref={audioRef} src={url}
        onTimeUpdate={() => { if (audioRef.current) setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1) * 100) }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration) }}
        onEnded={() => setPlaying(false)} />
      <button onClick={toggle} style={{ background: '#16a9ea', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }}>
        {playing ? <FaPause style={{ fontSize: '10px' }} /> : <FaPlay style={{ fontSize: '10px', marginRight: '-1px' }} />}
      </button>
      <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', position: 'relative' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#16a9ea', borderRadius: '2px', transition: 'width 0.1s' }} />
      </div>
      <span style={{ fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>
        {duration ? `${Math.floor(duration)}s` : '···'}
      </span>
    </div>
  )
}

// ─── Voice Recorder ───────────────────────────────────────────────────────────

function VoiceRecorder({ onSend }: { onSend: (blob: Blob) => Promise<void> }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
        : 'audio/ogg'
      const mr = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        stream.getTracks().forEach(t => t.stop())
        await onSend(blob)
        setSeconds(0)
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      toast.error('تعذر الوصول للميكروفون')
    }
  }

  const stop = () => {
    mediaRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <button
      onClick={recording ? stop : start}
      title={recording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
      style={{
        width: '40px', height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer',
        background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
        color: recording ? '#ef4444' : '#9ca3af',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}
    >
      {recording ? <FaStop style={{ fontSize: '12px' }} /> : <FaMicrophone style={{ fontSize: '14px' }} />}
      {recording && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-6px',
          background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: 700,
          borderRadius: '999px', padding: '1px 4px', minWidth: '20px', textAlign: 'center',
        }}>
          {seconds}s
        </span>
      )}
    </button>
  )
}

// ─── Chat Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages]   = useState<Message[]>([])
  const [team, setTeam]           = useState<Profile[]>([])
  const [text, setText]           = useState('')
  const [userId, setUserId]       = useState<string | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [sending, setSending]       = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const typingTimer = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles!messages_user_id_fkey(id, name, email, avatar_url, role)')
      .order('created_at', { ascending: true })
      .limit(100)
    if (data) setMessages(data as Message[])
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/admin'); return }
      setUserId(user.id)

      const [profileRes, teamRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profiles').select('*').order('name'),
      ])
      if (profileRes.data) setMyProfile(profileRes.data as Profile)
      if (teamRes.data) setTeam(teamRes.data as Profile[])
    })

    fetchMessages()

    // Real-time messages
    const msgChannel = supabase.channel('chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
        setTimeout(scrollToBottom, 100)
      })
      .subscribe()

    // Presence for typing
    const presenceChannel = supabase.channel('chat-presence', { config: { presence: { key: '' } } })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<{ name: string; typing: boolean }>()
        const typing = Object.values(state).flat().filter(u => u.typing).map(u => u.name)
        setTypingUsers(typing)
      })
      .subscribe()

    channelRef.current = presenceChannel

    return () => {
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [router, fetchMessages])

  useEffect(() => { scrollToBottom() }, [messages])

  const setTyping = (isTyping: boolean) => {
    channelRef.current?.track({ name: myProfile?.name || 'شخص ما', typing: isTyping })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)

    // Mention detection
    const atIndex = val.lastIndexOf('@')
    if (atIndex !== -1 && atIndex >= val.length - 20) {
      const query = val.slice(atIndex + 1).toLowerCase()
      setMentionQuery(query)
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }

    // Typing indicator
    setTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 2000)
  }

  const insertMention = (name: string) => {
    const atIndex = text.lastIndexOf('@')
    setText(text.slice(0, atIndex) + `@${name} `)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const sendMessage = async (content: string, audioUrl?: string, fileUrl?: string, fileName?: string) => {
    if (!userId) return
    setSending(true)

    const mentions = (content.match(/@(\S+)/g) || []).map(m => m.slice(1))

    const { error } = await supabase.from('messages').insert({
      user_id: userId,
      content: content || null,
      audio_url: audioUrl || null,
      file_url: fileUrl || null,
      file_name: fileName || null,
      mentions,
    })

    if (error) { toast.error('فشل الإرسال'); setSending(false); return }

    // Notify mentioned users
    for (const mentionName of mentions) {
      const mentioned = team.find(t => t.name === mentionName || t.name.includes(mentionName))
      if (mentioned && mentioned.id !== userId) {
        await supabase.from('notifications').insert({
          user_id: mentioned.id,
          type: 'mention',
          title: `ذكرك ${myProfile?.name || 'أحد الأعضاء'} في الشات`,
          body: content.slice(0, 80),
        })
      }
    }

    setText('')
    setTyping(false)
    setSending(false)
    await fetchMessages()
    scrollToBottom()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim()) sendMessage(text.trim())
    }
  }

  const handleFileSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploadingFile(true)
    const path = `chat/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('chat-files').upload(path, file)
    if (uploadError) { toast.error('فشل رفع الملف'); setUploadingFile(false); return }
    const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(path)
    await sendMessage('', undefined, publicUrl, file.name)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploadingFile(false)
  }

  const handleVoiceSend = async (blob: Blob) => {
    const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm'
    const fileName = `voice-${Date.now()}-${userId}.${ext}`
    const { data, error } = await supabase.storage.from('voice-notes').upload(fileName, blob, { contentType: blob.type })
    if (error) { toast.error(`فشل رفع الملف: ${error.message}`); return }
    const { data: { publicUrl } } = supabase.storage.from('voice-notes').getPublicUrl(data.path)
    await sendMessage('', publicUrl)
    toast.success('تم إرسال الرسالة الصوتية')
  }

  const filteredTeam = team.filter(t =>
    t.id !== userId &&
    (t.name.toLowerCase().includes(mentionQuery) || t.email.toLowerCase().includes(mentionQuery))
  )

  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' })
    const last = acc[acc.length - 1]
    if (last && last.date === date) { last.msgs.push(msg) } else { acc.push({ date, msgs: [msg] }) }
    return acc
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />

      <div style={{ flex: 1, marginRight: '220px', display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Header */}
        <header style={{
          background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: '60px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>💬</span>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>شات الفريق</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{team.length} عضو</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '-6px' }}>
              {team.slice(0, 4).map(t => (
                <div key={t.id} title={t.name} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${ROLE_COLORS[t.role]}25`,
                  border: `2px solid #0a0a0a`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: ROLE_COLORS[t.role],
                  marginLeft: '-6px',
                }}>
                  {getInitials(t.name || t.email)}
                </div>
              ))}
            </div>
            {userId && <NotificationBell userId={userId} />}
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {groupedMessages.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {msgs.map((msg, i) => {
                const isMe = msg.user_id === userId
                const prevMsg = msgs[i - 1]
                const sameUser = prevMsg && prevMsg.user_id === msg.user_id &&
                  (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 120000
                const profile = msg.profiles

                return (
                  <div key={msg.id} style={{
                    display: 'flex', gap: '10px', padding: '3px 0',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                  }}>
                    {/* Avatar */}
                    {!sameUser ? (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: profile ? `${ROLE_COLORS[profile.role]}25` : 'rgba(255,255,255,0.1)',
                        border: profile ? `1px solid ${ROLE_COLORS[profile.role]}40` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700,
                        color: profile ? ROLE_COLORS[profile.role] : '#9ca3af',
                      }}>
                        {getInitials(profile?.name || profile?.email || '?')}
                      </div>
                    ) : <div style={{ width: '32px', flexShrink: 0 }} />}

                    {/* Bubble */}
                    <div style={{ maxWidth: '65%' }}>
                      {!sameUser && !isMe && (
                        <div style={{ fontSize: '11px', color: profile ? ROLE_COLORS[profile.role] : '#9ca3af', fontWeight: 700, marginBottom: '3px' }}>
                          {profile?.name || profile?.email || 'مستخدم'}
                        </div>
                      )}
                      <div style={{
                        background: isMe ? 'rgba(22,169,234,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isMe ? 'rgba(22,169,234,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        padding: msg.audio_url ? '6px' : '10px 14px',
                      }}>
                        {msg.audio_url && <AudioPlayer url={msg.audio_url} />}
                        {msg.file_url && (() => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.file_name || msg.file_url)
                          return isImage ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                              <img src={msg.file_url} alt={msg.file_name || 'صورة'} style={{ maxWidth: '220px', maxHeight: '180px', borderRadius: '8px', display: 'block', objectFit: 'cover' }} />
                            </a>
                          ) : (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 12px', textDecoration: 'none', color: '#e5e7eb' }}>
                              <FaFileAlt style={{ color: '#8b5cf6', fontSize: '18px', flexShrink: 0 }} />
                              <span style={{ fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.file_name || 'ملف'}</span>
                              <FaDownload style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }} />
                            </a>
                          )
                        })()}
                        {msg.content && (
                          <p style={{ margin: 0, fontSize: '14px', color: '#e5e7eb', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {msg.content.split(/(@\S+)/g).map((part, j) =>
                              part.startsWith('@') ? (
                                <span key={j} style={{ color: '#16a9ea', fontWeight: 700 }}>{part}</span>
                              ) : part
                            )}
                          </p>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px', textAlign: isMe ? 'left' : 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', color: '#6b7280', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6b7280', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
              </div>
              {typingUsers.join(' و ')} يكتب...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 24px',
          background: 'rgba(10,10,10,0.9)',
          flexShrink: 0,
        }}>
          {/* Mention suggestions */}
          {showMentions && filteredTeam.length > 0 && (
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', marginBottom: '10px', overflow: 'hidden',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.4)',
            }}>
              {filteredTeam.slice(0, 5).map(t => (
                <button key={t.id} onClick={() => insertMention(t.name)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'white', fontFamily: 'Cairo, sans-serif', textAlign: 'right',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `${ROLE_COLORS[t.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: ROLE_COLORS[t.role] }}>
                    {getInitials(t.name || t.email)}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{t.name}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>@{t.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <button onClick={() => { setText(t => t + '@'); setShowMentions(true); inputRef.current?.focus() }}
              title="ذكر شخص"
              style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaAt style={{ fontSize: '14px' }} />
            </button>

            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالة... (Enter للإرسال، Shift+Enter لسطر جديد)"
                rows={1}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '10px 14px', color: 'white', fontSize: '14px',
                  outline: 'none', fontFamily: 'Cairo, sans-serif', textAlign: 'right', resize: 'none',
                  boxSizing: 'border-box', maxHeight: '120px', overflowY: 'auto',
                }}
              />
            </div>

            <label title="إرفاق ملف أو صورة" style={{
              width: '40px', height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: uploadingFile ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
              color: uploadingFile ? '#8b5cf6' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaPaperclip style={{ fontSize: '14px' }} />
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSend} disabled={uploadingFile}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.psd,.ai" />
            </label>

            <VoiceRecorder onSend={handleVoiceSend} />

            <button
              onClick={() => text.trim() && sendMessage(text.trim())}
              disabled={sending || !text.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '10px', border: 'none', flexShrink: 0,
                background: text.trim() ? '#16a9ea' : 'rgba(255,255,255,0.06)',
                color: text.trim() ? 'white' : '#6b7280', cursor: text.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >
              <FaPaperPlane style={{ fontSize: '13px' }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (max-width: 768px) {
          div[style*="margin-right: 220px"] { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  )
}
