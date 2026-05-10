import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'Cairo, sans-serif', background: '#0a0a0a', color: 'white', margin: 0 }}>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  )
}
