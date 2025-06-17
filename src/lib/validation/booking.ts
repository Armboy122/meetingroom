import { z } from 'zod'

// Booking form validation schema
export const bookingFormSchema = z.object({
  roomId: z.number(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  organizerId: z.string().min(1, 'Organizer is required'),
  needsRefreshment: z.boolean().optional().default(false),
  refreshmentSets: z.number().int().min(1).optional(),
  refreshmentNote: z.string().optional(),
})

// API booking creation schema
export const bookingCreateSchema = z.object({
  roomId: z.number(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  startDatetime: z.string().datetime('Invalid datetime format'),
  endDatetime: z.string().datetime('Invalid datetime format'),
  createdBy: z.string().min(1).max(100).optional(),
  organizerId: z.string().min(1, 'Organizer is required'),
  needsRefreshment: z.boolean().default(false),
  refreshmentSets: z.number().int().min(1, 'Refreshment sets must be at least 1').optional(),
  refreshmentNote: z.string().optional(),
  participants: z.array(z.object({
    participantName: z.string().min(1, 'Participant name is required').max(100, 'Participant name must be less than 100 characters'),
    participantEmail: z.string().email('Invalid email format').optional()
  })).optional()
})

// Participant validation schema
export const participantSchema = z.object({
  participantName: z.string().min(1, 'Participant name is required').max(100),
  participantEmail: z.string().email('Invalid email format').optional()
})

// Booking update schema
export const bookingUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'approved', 'confirmed', 'rejected']).optional(),
  approvedBy: z.string().optional(),
  rejectedReason: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>
export type BookingCreateData = z.infer<typeof bookingCreateSchema>
export type ParticipantData = z.infer<typeof participantSchema>
export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>