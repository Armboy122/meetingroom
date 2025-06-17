'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/loading'
import { InlineError } from '@/components/error'
import { Plus, Edit, Trash2, User, Upload, Download, Users } from 'lucide-react'
import { showErrorPopup, showConfirmPopup, showSuccessPopup } from '@/components/ui/popup'

interface User {
  userId: string
  employeeId: string
  fullName: string
  position?: string
  department?: string
  email?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface UserFormData {
  employeeId: string
  fullName: string
  position: string
  department: string
  email: string
}

export function UserSection() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    employeeId: '',
    fullName: '',
    position: '',
    department: '',
    email: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        employeeId: user.employeeId,
        fullName: user.fullName,
        position: user.position || '',
        department: user.department || '',
        email: user.email || ''
      })
    } else {
      setEditingUser(null)
      setFormData({
        employeeId: '',
        fullName: '',
        position: '',
        department: '',
        email: ''
      })
    }
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      const url = editingUser 
        ? `/api/admin/users/${editingUser.userId}`
        : '/api/admin/users'
      
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาด')
      }

      await fetchUsers()
      closeModal()
      showSuccessPopup('สำเร็จ', editingUser ? 'แก้ไขข้อมูลผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้สำเร็จ')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user: User) => {
    showConfirmPopup(
      'ยืนยันการลบ',
      `ต้องการลบผู้ใช้ "${user.fullName}" หรือไม่?`,
      async () => {
        try {
          const response = await fetch(`/api/admin/users/${user.userId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการลบ')
          }

          await fetchUsers()
          showSuccessPopup('สำเร็จ', 'ลบผู้ใช้สำเร็จ')
        } catch (error) {
          showErrorPopup('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบ')
        }
      }
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showErrorPopup('ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setImporting(true)
    fetch('/api/admin/users/import', {
      method: 'POST',
      body: formData,
    })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการ import')
      }
      return response.json()
    })
    .then((result) => {
      showSuccessPopup('Import สำเร็จ', `นำเข้าข้อมูล ${result.imported} รายการ, อัปเดต ${result.updated} รายการ`)
      fetchUsers()
    })
    .catch((error) => {
      showErrorPopup('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการ import')
    })
    .finally(() => {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    })
  }

  const downloadTemplate = () => {
    const template = `รหัส,ชื่อ - สกุล,ตำแหน่ง,สังกัด
331980,นายสำราญ ขุนฤทธิ์,ผู้ช่วยผู้ว่าการ,ผชก.(ต3)/สชก.(ต3)
123456,นายตัวอย่าง ตัวอย่าง,พนักงาน,แผนกตัวอย่าง`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'user-template.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <LoadingState message="กำลังโหลดข้อมูลผู้ใช้..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h2>
          <p className="text-gray-600">เพิ่ม แก้ไข หรือลบข้อมูลผู้ใช้</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'กำลัง Import...' : 'Import Excel'}
          </Button>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <InlineError message={error} onRetry={fetchUsers} />
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            รายชื่อผู้ใช้ ({users.length} คน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">รหัสพนักงาน</th>
                  <th className="text-left py-2">ชื่อ-สกุล</th>
                  <th className="text-left py-2">ตำแหน่ง</th>
                  <th className="text-left py-2">สังกัด</th>
                  <th className="text-left py-2">อีเมล</th>
                  <th className="text-left py-2">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-b hover:bg-gray-50">
                    <td className="py-2">{user.employeeId}</td>
                    <td className="py-2 font-medium">{user.fullName}</td>
                    <td className="py-2">{user.position || '-'}</td>
                    <td className="py-2">{user.department || '-'}</td>
                    <td className="py-2">{user.email || '-'}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีผู้ใช้</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มผู้ใช้หรือ import จาก Excel</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มผู้ใช้ใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
              </CardTitle>
              <CardDescription>
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'กรอกข้อมูลผู้ใช้ใหม่'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">รหัสพนักงาน *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="เช่น 331980"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">ชื่อ-สกุล *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="เช่น นายสำราญ ขุนฤทธิ์"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="เช่น ผู้ช่วยผู้ว่าการ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">สังกัด</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="เช่น ผชก.(ต3)/สชก.(ต3)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="เช่น example@example.com"
                  />
                </div>

                {formError && (
                  <InlineError message={formError} />
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'กำลังบันทึก...' : (editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}