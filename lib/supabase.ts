import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Enums ───────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'in_progress' | 'done'
export type KanbanColumn = 'new' | 'pending' | 'design' | 'printing' | 'delivered' | 'completed'
export type UserRole = 'owner' | 'manager' | 'employee'
export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type ActivityType = 'created' | 'status_changed' | 'assigned' | 'note_added' | 'contacted' | 'completed' | 'column_moved'

// ─── Models ──────────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  last_active: string
  created_at: string
}

export type Lead = {
  id: string
  created_at: string
  name: string
  phone: string
  service: string
  message: string
  status: LeadStatus
  kanban_column: KanbanColumn
  assigned_to: string | null
  tags: string[]
  deadline: string | null
  priority: Priority
  position: number
  profiles?: Profile | null
}

export type OrderActivity = {
  id: string
  lead_id: string
  user_id: string | null
  type: ActivityType
  content: string | null
  metadata: Record<string, unknown>
  created_at: string
  profiles?: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
}

export type OrderFile = {
  id: string
  lead_id: string
  name: string
  url: string
  size: number | null
  uploaded_by: string | null
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: 'new_order' | 'assigned' | 'status_changed' | 'mention'
  title: string
  body: string | null
  lead_id: string | null
  read: boolean
  created_at: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'جديد',
  in_progress: 'قيد المتابعة',
  done: 'منجز',
}

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  done: 'bg-green-500/15 text-green-400 border-green-500/30',
}

export const KANBAN_COLUMNS: { id: KanbanColumn; label: string; color: string; bg: string }[] = [
  { id: 'new',       label: 'جديد',          color: '#3b82f6', bg: '#3b82f620' },
  { id: 'pending',   label: 'قيد المراجعة',  color: '#f59e0b', bg: '#f59e0b20' },
  { id: 'design',    label: 'في التصميم',    color: '#8b5cf6', bg: '#8b5cf620' },
  { id: 'printing',  label: 'في الطباعة',    color: '#ef4444', bg: '#ef444420' },
  { id: 'delivered', label: 'تم التسليم',    color: '#06b6d4', bg: '#06b6d420' },
  { id: 'completed', label: 'مكتمل',         color: '#22c55e', bg: '#22c55e20' },
]

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'منخفض', normal: 'عادي', high: 'عالي', urgent: 'عاجل',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#6b7280', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'المالك', manager: 'مدير', employee: 'موظف',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  owner: '#f59e0b', manager: '#8b5cf6', employee: '#3b82f6',
}

export const SERVICES = [
  'طباعة الملابس',
  'طباعة الحقائب',
  'تغليف احترافي',
  'الهوية البصرية',
  'المواد الإعلانية',
  'طباعة مخصصة',
  'الدروبشيبينغ',
  'استشارات الطباعة',
  'هوية الشركات',
  'أخرى',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const waLink = (phone: string, name: string, service: string) => {
  const msg = `السلام عليكم ${name}، معكم فريق Tingis Print بخصوص طلبكم: ${service}`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ar-MA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
