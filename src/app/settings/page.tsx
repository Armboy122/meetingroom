'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/shared/AdminHeader'
import { AdminTabNavigation, type AdminTab } from '@/components/admin/shared/AdminTabNavigation'
import { RoomSection } from '@/components/admin/sections/RoomSection'
import { LoadingState } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/error'

export default function NewSettingsPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('rooms')

  const handleBack = () => {
    window.location.href = '/'
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rooms':
        return <RoomSection />
      case 'approvals':
        return <div className="text-center py-12">อนุมัติการจอง - Coming Soon</div>
      case 'divisions':
        return <div className="text-center py-12">จัดการกอง - Coming Soon</div>
      case 'departments':
        return <div className="text-center py-12">จัดการแผนก - Coming Soon</div>
      case 'users':
        return <div className="text-center py-12">จัดการผู้ใช้ - Coming Soon</div>
      case 'room-closures':
        return <div className="text-center py-12">จัดการการปิดห้อง - Coming Soon</div>
      default:
        return <div className="text-center py-12">เลือกแท็บเพื่อดูเนื้อหา</div>
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <AdminHeader onBack={handleBack} />
          
          <AdminTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={0} // TODO: Get from API
          />

          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}