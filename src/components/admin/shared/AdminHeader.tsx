import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

interface AdminHeaderProps {
  onBack: () => void
  onLogout?: () => void
}

export function AdminHeader({ onBack, onLogout }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปหน้าหลัก
        </Button>
        
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600">จัดการระบบจองห้องประชุม</p>
          </div>
        </div>
      </div>

      {onLogout && (
        <Button variant="outline" size="sm" onClick={onLogout}>
          ออกจากระบบ Admin
        </Button>
      )}
    </div>
  )
}