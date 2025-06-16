'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface DivisionModalProps {
  open: boolean
  onClose: () => void
  division?: Division | null
  onSubmit: (data: { divisionName: string, adminPassword: string }) => Promise<void>
  loading: boolean
  error: string
}

export default function DivisionModal({
  open,
  onClose,
  division,
  onSubmit,
  loading,
  error
}: DivisionModalProps) {
  const [formData, setFormData] = useState({
    divisionName: division?.divisionName || '',
    adminPassword: ''
  })

  useEffect(() => {
    setFormData({
      divisionName: division?.divisionName || '',
      adminPassword: ''
    })
  }, [division])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({ divisionName: '', adminPassword: '' })
  }

  const handleClose = () => {
    setFormData({ divisionName: '', adminPassword: '' })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {division ? 'แก้ไขกอง' : 'เพิ่มกองใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="divisionName">ชื่อกอง *</Label>
            <Input
              id="divisionName"
              value={formData.divisionName}
              onChange={(e) => setFormData({...formData, divisionName: e.target.value})}
              placeholder="เช่น กองบริหารและสนับสนุน"
              required
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
              disabled={loading || !formData.divisionName || !formData.adminPassword}
            >
              {loading ? 'กำลังบันทึก...' : division ? 'อัพเดต' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}