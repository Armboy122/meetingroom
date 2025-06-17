import { z } from 'zod'

export const roomSchema = z.object({
  roomName: z.string().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(1000, 'Capacity must be less than 1000'),
  equipment: z.string().optional(),
})

export const roomClosureSchema = z.object({
  roomId: z.number(),
  startDatetime: z.string().datetime('Invalid datetime format'),
  endDatetime: z.string().datetime('Invalid datetime format'),
  reason: z.string().min(1, 'Reason is required').max(255),
  createdBy: z.string().min(1, 'Created by is required').max(100),
})

export type RoomFormData = z.infer<typeof roomSchema>
export type RoomClosureFormData = z.infer<typeof roomClosureSchema>