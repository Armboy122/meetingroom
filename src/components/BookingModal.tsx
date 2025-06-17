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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ParticipantManager } from './ParticipantManager'

interface Room {
  roomId: number
  roomName: string
  capacity: number
  equipment?: string
}

interface User {
  userId: string
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
  department?: {
    departmentName: string
  }
  division?: {
    divisionName: string
  }
}

interface Participant {
  participantName: string
  participantEmail?: string
}

interface BookingModalProps {
  open: boolean
  onClose: () => void
  selectedRoomId?: number
  selectedStartTime?: Date
  selectedEndTime?: Date
  onBookingCreated: () => void
}

const bookingSchema = z.object({
  roomId: z.number(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  organizerId: z.string().min(1, 'Organizer is required'),
  needsRefreshment: z.boolean().default(false),
  refreshmentSets: z.number().int().min(1).optional(),
  refreshmentNote: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function BookingModal({
  open,
  onClose,
  selectedRoomId,
  selectedStartTime,
  selectedEndTime,
  onBookingCreated
}: BookingModalProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate time slots (8:00 AM to 6:00 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<BookingFormData>()

  const watchedRoomId = watch('roomId')
  const watchedNeedsRefreshment = watch('needsRefreshment')
  const watchedStartTime = watch('startTime')
  const watchedBookingDate = watch('bookingDate')

  useEffect(() => {
    if (open) {
      fetchRooms()
      fetchUsers()
      if (selectedRoomId) {
        setValue('roomId', selectedRoomId)
      }
      if (selectedStartTime) {
        // Extract date and time from selectedStartTime
        const date = format(selectedStartTime, 'yyyy-MM-dd')
        const time = format(selectedStartTime, 'HH:mm')
        setValue('bookingDate', date)
        setValue('startTime', time)
      }
      if (selectedEndTime) {
        // Extract time from selectedEndTime
        const time = format(selectedEndTime, 'HH:mm')
        setValue('endTime', time)
      }
    }
  }, [open, selectedRoomId, selectedStartTime, selectedEndTime, setValue])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Combine date and time to create datetime objects
      const startDatetime = new Date(`${data.bookingDate}T${data.startTime}:00`)
      const endDatetime = new Date(`${data.bookingDate}T${data.endTime}:00`)

      const requestData = {
        roomId: data.roomId,
        title: data.title,
        description: data.description,
        startDatetime: startDatetime.toISOString(),
        endDatetime: endDatetime.toISOString(),
        organizerId: data.organizerId,
        participants: participants.length > 0 ? participants : undefined,
        needsRefreshment: data.needsRefreshment,
        refreshmentSets: data.needsRefreshment ? data.refreshmentSets : undefined,
        refreshmentNote: data.refreshmentNote,
      }

      console.log('Creating booking with data:', requestData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Booking creation failed:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to create booking')
      }

      onBookingCreated()
      handleClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setParticipants([])
    setError(null)
    onClose()
  }

  const selectedRoom = rooms.find(room => room.roomId === watchedRoomId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Meeting Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter meeting title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Meeting description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Room *</Label>
            <Select
              value={watchedRoomId?.toString()}
              onValueChange={(value) => setValue('roomId', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.roomId} value={room.roomId.toString()}>
                    {room.roomName} (Capacity: {room.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && (
              <p className="text-red-500 text-sm">Room is required</p>
            )}
          </div>

          {selectedRoom && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-semibold text-blue-900">{selectedRoom.roomName}</h4>
              <p className="text-blue-800 text-sm">Capacity: {selectedRoom.capacity} people</p>
              {selectedRoom.equipment && (
                <p className="text-blue-800 text-sm">Equipment: {selectedRoom.equipment}</p>
              )}
            </div>
          )}

          {/* Organizer Selection */}
          <div className="space-y-2">
            <Label htmlFor="organizerId">ผู้จัด (Organizer) *</Label>
            <Select onValueChange={(value) => setValue('organizerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกผู้จัดการประชุม" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    {user.fullName} ({user.employeeId}) - {user.department?.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizerId && (
              <p className="text-red-500 text-sm">{errors.organizerId.message}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="bookingDate">วันที่ *</Label>
            <Input
              id="bookingDate"
              type="date"
              {...register('bookingDate')}
            />
            {errors.bookingDate && (
              <p className="text-red-500 text-sm">{errors.bookingDate.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">เวลาเริ่ม *</Label>
              <Select onValueChange={(value) => setValue('startTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเวลาเริ่ม" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startTime && (
                <p className="text-red-500 text-sm">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">เวลาสิ้นสุด *</Label>
              <Select onValueChange={(value) => setValue('endTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเวลาสิ้นสุด" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.filter(time => {
                    if (!watchedStartTime) return true
                    const startIndex = timeSlots.indexOf(watchedStartTime)
                    const currentIndex = timeSlots.indexOf(time)
                    return currentIndex > startIndex
                  }).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-red-500 text-sm">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
            <h3 className="font-semibold text-orange-900">การเตรียมขนมเบรก</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="needsRefreshment"
                {...register('needsRefreshment')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="needsRefreshment">ต้องการขนมเบรก</Label>
            </div>

            {watchedNeedsRefreshment && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="refreshmentSets">จำนวนชุดขนมเบรก *</Label>
                  <Input
                    id="refreshmentSets"
                    type="number"
                    min="1"
                    {...register('refreshmentSets', { valueAsNumber: true })}
                    placeholder="เช่น 10"
                  />
                  {errors.refreshmentSets && (
                    <p className="text-red-500 text-sm">{errors.refreshmentSets.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="refreshmentNote">หมายเหตุขนมเบรก</Label>
                  <Textarea
                    id="refreshmentNote"
                    {...register('refreshmentNote')}
                    placeholder="เช่น ไม่ใส่น้ำตาล, มีผู้แพ้อาหาร, เป็นต้น"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          <ParticipantManager
            participants={participants}
            onParticipantsChange={setParticipants}
            users={users}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}