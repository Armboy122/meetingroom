'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState, InlineLoading } from '@/components/ui/loading'
import { InlineError } from '@/components/error'
import { useAdminAuth } from '@/hooks/admin/useAdminAuth'
import { Shield, Eye, EyeOff } from 'lucide-react'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const {
    isAuthenticated,
    adminPassword,
    setAdminPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    authenticateAdmin
  } = useAdminAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword.trim()) {
      await authenticateAdmin(adminPassword)
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Authentication</CardTitle>
          <CardDescription>
            กรุณาป้อนรหัสผ่าน Admin เพื่อเข้าสู่หน้าการตั้งค่า
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน Admin</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="ป้อนรหัสผ่าน Admin"
                  disabled={loading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <InlineError message={error} />
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !adminPassword.trim()}
            >
              {loading ? (
                <InlineLoading message="กำลังตรวจสอบ..." />
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}