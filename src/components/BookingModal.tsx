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
  startDatetime: z.date(),
  endDatetime: z.date(),
  createdBy: z.string().min(1, 'Created by is required').max(100),
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
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<BookingFormData>()

  const watchedRoomId = watch('roomId')

  useEffect(() => {
    if (open) {
      fetchRooms()
      if (selectedRoomId) {
        setValue('roomId', selectedRoomId)
      }
      if (selectedStartTime) {
        setValue('startDatetime', selectedStartTime)
      }
      if (selectedEndTime) {
        setValue('endDatetime', selectedEndTime)
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

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDatetime: data.startDatetime.toISOString(),
          endDatetime: data.endDatetime.toISOString(),
          participants: participants.length > 0 ? participants : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="createdBy">Organizer *</Label>
              <Input
                id="createdBy"
                {...register('createdBy')}
                placeholder="Your name"
              />
              {errors.createdBy && (
                <p className="text-red-500 text-sm">{errors.createdBy.message}</p>
              )}
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDatetime">Start Time *</Label>
              <Input
                id="startDatetime"
                type="datetime-local"
                {...register('startDatetime', { valueAsDate: true })}
              />
              {errors.startDatetime && (
                <p className="text-red-500 text-sm">{errors.startDatetime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDatetime">End Time *</Label>
              <Input
                id="endDatetime"
                type="datetime-local"
                {...register('endDatetime', { valueAsDate: true })}
              />
              {errors.endDatetime && (
                <p className="text-red-500 text-sm">{errors.endDatetime.message}</p>
              )}
            </div>
          </div>

          <ParticipantManager
            participants={participants}
            onParticipantsChange={setParticipants}
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