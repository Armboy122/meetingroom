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

interface DepartmentModalProps {
  open: boolean
  onClose: () => void
  department?: Department | null
  divisions: Division[]
  onSubmit: (data: { departmentName: string, divisionId: string, adminPassword: string }) => Promise<void>
  loading: boolean
  error: string
}

export default function DepartmentModal({
  open,
  onClose,
  department,
  divisions,
  onSubmit,
  loading,
  error
}: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    departmentName: department?.departmentName || '',
    divisionId: department?.divisionId || '',
    adminPassword: ''
  })

  useEffect(() => {
    setFormData({
      departmentName: department?.departmentName || '',
      divisionId: department?.divisionId || '',
      adminPassword: ''
    })
  }, [department])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({ departmentName: '', divisionId: '', adminPassword: '' })
  }

  const handleClose = () => {
    setFormData({ departmentName: '', divisionId: '', adminPassword: '' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="departmentName">ชื่อแผนก *</Label>
            <Input
              id="departmentName"
              value={formData.departmentName}
              onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
              placeholder="เช่น แผนกบริหารงานทั่วไป"
              required
            />
          </div>

          <div>
            <Label>กอง *</Label>
            <Select
              value={formData.divisionId}
              onValueChange={(value) => setFormData({...formData, divisionId: value})}
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
              disabled={loading || !formData.departmentName || !formData.divisionId || !formData.adminPassword}
            >
              {loading ? 'กำลังบันทึก...' : department ? 'อัพเดต' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}