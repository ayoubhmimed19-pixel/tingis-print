export function Skeleton({ width = '100%', height = '16px', radius = '8px', style = {} }: {
  width?: string | number
  height?: string | number
  radius?: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

export function KanbanCardSkeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <Skeleton width="60%" height="14px" />
        <Skeleton width="48px" height="20px" radius="999px" />
      </div>
      <Skeleton width="40%" height="22px" radius="6px" />
      <Skeleton width="50%" height="12px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="60px" height="11px" />
        <Skeleton width="52px" height="26px" radius="8px" />
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

export function KanbanColumnSkeleton() {
  return (
    <div style={{ minWidth: '260px', width: '260px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Skeleton width="8px" height="8px" radius="50%" />
        <Skeleton width="80px" height="13px" />
        <Skeleton width="28px" height="20px" radius="999px" style={{ marginRight: 'auto' }} />
      </div>
      {[1, 2, 3].map(i => <KanbanCardSkeleton key={i} />)}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}
