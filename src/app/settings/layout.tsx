import { AdminAuthGuard } from '@/components/admin/shared/AdminAuthGuard'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      {children}
    </AdminAuthGuard>
  )
}