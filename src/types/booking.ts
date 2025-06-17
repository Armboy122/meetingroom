import { Room } from './room'
import { User } from './user'

export type BookingStatus = 'pending' | 'approved' | 'confirmed' | 'rejected'

export interface Booking {
  bookingId: string
  roomId: number
  title: string
  description?: string
  startDatetime: string
  endDatetime: string
  status: BookingStatus
  organizerId?: string
  createdBy?: string
  needsRefreshment: boolean
  refreshmentSets?: number
  refreshmentNote?: string
  approvedBy?: string
  approvedAt?: Date
  rejectedReason?: string
  createdAt: Date
  updatedAt: Date
  room?: Room
  organizer?: User
  participants?: Participant[]
}

export interface Participant {
  participantId?: string
  participantName: string
  participantEmail?: string
  bookingId?: string
  addedAt?: Date
}

export interface BookingFormData {
  roomId: number
  title: string
  description?: string
  bookingDate: string
  startTime: string
  endTime: string
  organizerId: string
  needsRefreshment: boolean
  refreshmentSets?: number
  refreshmentNote?: string
}

export interface BookingCreateRequest {
  roomId: number
  title: string
  description?: string
  startDatetime: string
  endDatetime: string
  organizerId: string
  participants?: Participant[]
  needsRefreshment: boolean
  refreshmentSets?: number
  refreshmentNote?: string
}

export interface BookingDetailsModalProps {
  booking: {
    bookingId: string
    bookingTitle: string
    startTime: string
    endTime: string
    description?: string
    createdBy: string
    participants: Participant[]
    room: {
      roomId: number
      roomName: string
      capacity: number
      equipment: string[]
    }
  } | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}