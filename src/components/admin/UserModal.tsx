'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'

interface Division {
  divisionId: string
  divisionName: string
}

interface Department {
  departmentId: string
  departmentName: string
  divisionId: string
  division?: Division
}

interface User {
  userId: string
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
  status: string
  department?: Department
  division?: Division
}

interface UserModalProps {
  open: boolean
  onClose: () => void
  user?: User | null
  divisions: Division[]
  departments: Department[]
  onSubmit: (data: { employeeId: string, fullName: string, departmentId: string, divisionId: string, email: string, adminPassword: string }) => Promise<void>
  loading: boolean
  error: string
}

export default function UserModal({
  open,
  onClose,
  user,
  divisions,
  departments,
  onSubmit,
  loading,
  error
}: UserModalProps) {
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || '',
    fullName: user?.fullName || '',
    departmentId: user?.departmentId || '',
    divisionId: user?.divisionId || '',
    email: user?.email || '',
    adminPassword: ''
  })

  useEffect(() => {
    setFormData({
      employeeId: user?.employeeId || '',
      fullName: user?.fullName || '',
      departmentId: user?.departmentId || '',
      divisionId: user?.divisionId || '',
      email: user?.email || '',
      adminPassword: ''
    })
  }, [user])

  // Filter departments based on selected division
  const filteredDepartments = departments.filter(dept => dept.divisionId === formData.divisionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({ employeeId: '', fullName: '', departmentId: '', divisionId: '', email: '', adminPassword: '' })
  }

  const handleClose = () => {
    setFormData({ employeeId: '', fullName: '', departmentId: '', divisionId: '', email: '', adminPassword: '' })
    onClose()
  }

  const handleDivisionChange = (divisionId: string) => {
    setFormData({
      ...formData,
      divisionId,
      departmentId: '' // Reset department when division changes
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">รหัสพนักงาน *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="เช่น EMP001"
                required
              />
            </div>

            <div>
              <Label htmlFor="fullName">ชื่อ-สกุล *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="เช่น สมชาย ใจดี"
                required
              />
            </div>
          </div>

          <div>
            <Label>กอง *</Label>
            <Select
              value={formData.divisionId}
              onValueChange={handleDivisionChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกกอง" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.divisionId} value={division.divisionId}>
                    {division.divisionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>แผนก *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData({...formData, departmentId: value})}
              required
              disabled={!formData.divisionId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.divisionId ? "เลือกแผนก" : "เลือกกองก่อน"} />
              </SelectTrigger>
              <SelectContent>
                {filteredDepartments.map((department) => (
                  <SelectItem key={department.departmentId} value={department.departmentId}>
                    {department.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="เช่น somchai@company.com"
            />
          </div>

          <div>
            <Label htmlFor="adminPassword">รหัสผ่าน Admin *</Label>
            <Input
              id="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
              placeholder="ใส่รหัสผ่าน Admin"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.employeeId || !formData.fullName || !formData.departmentId || !formData.divisionId || !formData.adminPassword}
            >
              {loading ? 'กำลังบันทึก...' : user ? 'อัพเดต' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}