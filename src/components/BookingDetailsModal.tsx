'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Users, Clock, Calendar, User, Edit, Trash2, Lock, Eye, EyeOff } from 'lucide-react'
import { ParticipantManager } from './ParticipantManager'
import { showErrorPopup, showConfirmPopup } from '@/components/ui/popup'

interface Booking {
  bookingId: number
  bookingTitle: string
  startTime: string
  endTime: string
  description?: string
  createdBy: string
  organizer?: {
    userId: string
    employeeId: string
    fullName: string
    email?: string
  }
  participants: Array<{
    participantName: string
  }>
  room: {
    roomId: number
    roomName: string
    capacity: number
    equipment: string[]
  }
}

interface Participant {
  participantName: string
}

interface BookingDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const editBookingSchema = z.object({
  bookingTitle: z.string().min(1, 'กรุณาใส่ชื่อการประชุม'),
  description: z.string().optional(),
  adminPassword: z.string().min(1, 'กรุณาใส่รหัสผ่าน Admin'),
})

type EditBookingFormData = z.infer<typeof editBookingSchema>

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdate,
}: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditBookingFormData>()

  useEffect(() => {
    if (booking && isOpen) {
      setParticipants(booking.participants || [])
      setValue('bookingTitle', booking.bookingTitle)
      setValue('description', booking.description || '')
      setError(null)
    }
  }, [booking, isOpen, setValue])

  const handleClose = () => {
    setIsEditing(false)
    setShowPassword(false)
    setError(null)
    reset()
    onClose()
  }

  const onSubmit = async (data: EditBookingFormData) => {
    if (!booking) return

    // ตรวจสอบรหัสผ่าน admin
    if (data.adminPassword !== 'Armoff122*') {
      setError('รหัสผ่าน Admin ไม่ถูกต้อง')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingTitle: data.bookingTitle,
          description: data.description,
          participants: participants,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการแก้ไข')
      }

      setIsEditing(false)
      onUpdate()
      handleClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!booking) return
    
    const adminPassword = prompt('กรุณาใส่รหัสผ่าน Admin เพื่อลบการจอง:')
    
    if (adminPassword !== 'Armoff122*') {
      showErrorPopup('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่าน Admin ไม่ถูกต้อง')
      return
    }

    showConfirmPopup(
      'ยืนยันการลบ',
      'คุณแน่ใจหรือไม่ที่จะลบการจองนี้?',
      async () => {
        setIsLoading(true)
        setError(null)

        try {
          const response = await fetch(`/api/bookings/${booking.bookingId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการลบ')
          }

          onUpdate()
          handleClose()
        } catch (error) {
          setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
        } finally {
          setIsLoading(false)
        }
      }
    )
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isEditing ? 'แก้ไขการจอง' : 'รายละเอียดการจอง'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ชื่อการประชุม</Label>
                  <p className="text-lg font-semibold">{booking.bookingTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ผู้จอง</Label>
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {booking.organizer?.fullName || booking.createdBy || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ห้องประชุม</Label>
                  <p className="font-medium">{booking.room.roomName}</p>
                  <p className="text-sm text-gray-500">
                    <Users className="w-4 h-4 inline mr-1" />
                    ความจุ {booking.room.capacity} คน
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">อุปกรณ์</Label>
                  <p className="text-sm">{booking.room.equipment.join(', ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">เวลาเริ่ม</Label>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.startTime), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">เวลาสิ้นสุด</Label>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.endTime), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {booking.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">รายละเอียด</Label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{booking.description}</p>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">
                  ผู้เข้าร่วมประชุม ({booking.participants.length} คน)
                </Label>
                {booking.participants.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {booking.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{participant.participantName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">ไม่มีผู้เข้าร่วมประชุม</p>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="bookingTitle">ชื่อการประชุม *</Label>
                <Input
                  id="bookingTitle"
                  {...register('bookingTitle')}
                  placeholder="ระบุชื่อการประชุม"
                />
                {errors.bookingTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.bookingTitle.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="รายละเอียดเพิ่มเติม (ไม่จำเป็น)"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">ผู้เข้าร่วมประชุม</Label>
                <ParticipantManager
                  participants={participants}
                  onParticipantsChange={setParticipants}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="adminPassword">รหัสผ่าน Admin *</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('adminPassword')}
                    placeholder="กรุณาใส่รหัสผ่าน Admin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.adminPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminPassword.message}</p>
                )}
              </div>
            </form>
          )}
        </div>

        <DialogFooter>
          {!isEditing ? (
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                แก้ไข
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                ลบ
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose} className="ml-auto">
                ปิด
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="ml-auto"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 