'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

interface PendingBooking {
  bookingId: string
  roomId: number
  title: string
  description?: string
  startDatetime: string
  endDatetime: string
  createdBy?: string
  createdAt: string
  room: {
    roomName: string
  }
  organizer?: {
    fullName: string
    department?: {
      departmentName: string
    }
    division?: {
      divisionName: string
    }
  }
  participants?: Array<{
    participantName: string
    participantEmail?: string
  }>
}

interface ApprovalModalProps {
  open: boolean
  onClose: () => void
  booking: PendingBooking | null
  action: 'approve' | 'reject'
  onSubmit: (data: { action: string, reason: string, approvedBy: string, adminPassword: string }) => Promise<void>
  loading: boolean
  error: string
}

export default function ApprovalModal({
  open,
  onClose,
  booking,
  action,
  onSubmit,
  loading,
  error
}: ApprovalModalProps) {
  const [formData, setFormData] = useState({
    reason: '',
    approvedBy: '',
    adminPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      action,
      reason: formData.reason,
      approvedBy: formData.approvedBy,
      adminPassword: formData.adminPassword
    })
    setFormData({ reason: '', approvedBy: '', adminPassword: '' })
  }

  const handleClose = () => {
    setFormData({ reason: '', approvedBy: '', adminPassword: '' })
    onClose()
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                อนุมัติการจอง
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                ปฏิเสธการจอง
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{booking.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>ห้อง:</strong> {booking.room.roomName}</p>
                <p><strong>วันที่:</strong> {format(new Date(booking.startDatetime), 'dd/MM/yyyy')}</p>
                <p><strong>เวลา:</strong> {format(new Date(booking.startDatetime), 'HH:mm')} - {format(new Date(booking.endDatetime), 'HH:mm')}</p>
              </div>
              <div>
                <p><strong>ผู้จอง:</strong> {booking.organizer?.fullName || booking.createdBy}</p>
                <p><strong>แผนก:</strong> {booking.organizer?.department?.departmentName || '-'}</p>
                <p><strong>กอง:</strong> {booking.organizer?.division?.divisionName || '-'}</p>
              </div>
            </div>
            {booking.description && (
              <p className="mt-2 text-sm"><strong>รายละเอียด:</strong> {booking.description}</p>
            )}
            {booking.participants && booking.participants.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">ผู้เข้าร่วม:</p>
                <ul className="text-sm text-gray-600 ml-4">
                  {booking.participants.map((p, i) => (
                    <li key={i}>• {p.participantName} {p.participantEmail && `(${p.participantEmail})`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="approvedBy">ชื่อผู้{action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'} *</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => setFormData({...formData, approvedBy: e.target.value})}
                placeholder="ใส่ชื่อของคุณ"
                required
              />
            </div>

            {action === 'reject' && (
              <div>
                <Label htmlFor="reason">เหตุผลในการปฏิเสธ</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="ระบุเหตุผลในการปฏิเสธ (ถ้ามี)"
                  rows={3}
                />
              </div>
            )}

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
                disabled={loading || !formData.approvedBy || !formData.adminPassword}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={action === 'reject' ? 'destructive' : 'default'}
              >
                {loading ? 'กำลังดำเนินการ...' : action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}