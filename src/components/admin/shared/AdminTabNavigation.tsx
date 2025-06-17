import { Button } from '@/components/ui/button'
import { CheckCircle, Building, Users, UserPlus, Monitor, Calendar } from 'lucide-react'

export type AdminTab = 'approvals' | 'divisions' | 'departments' | 'users' | 'rooms' | 'room-closures'

interface AdminTabNavigationProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  pendingCount?: number
}

export function AdminTabNavigation({ 
  activeTab, 
  onTabChange, 
  pendingCount = 0 
}: AdminTabNavigationProps) {
  const tabs = [
    {
      id: 'approvals' as AdminTab,
      label: 'อนุมัติการจอง',
      icon: CheckCircle,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'divisions' as AdminTab,
      label: 'จัดการกอง',
      icon: Building,
    },
    {
      id: 'departments' as AdminTab,
      label: 'จัดการแผนก',
      icon: Users,
    },
    {
      id: 'users' as AdminTab,
      label: 'จัดการผู้ใช้',
      icon: UserPlus,
    },
    {
      id: 'rooms' as AdminTab,
      label: 'จัดการห้องประชุม',
      icon: Monitor,
    },
    {
      id: 'room-closures' as AdminTab,
      label: 'จัดการการปิดห้อง',
      icon: Calendar,
    },
  ]

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-sm font-medium text-center border-b-2 transition-colors
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}