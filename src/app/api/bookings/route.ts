import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BookingSchema = z.object({
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const roomId = searchParams.get('roomId')

    let whereClause: any = {
      status: { in: ['approved', 'confirmed'] }
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      whereClause.startDatetime = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    if (roomId) {
      whereClause.roomId = parseInt(roomId)
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        room: true,
        participants: true
      },
      orderBy: {
        startDatetime: 'asc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = BookingSchema.parse(body)

    const startTime = new Date(validatedData.startDatetime)
    const endTime = new Date(validatedData.endDatetime)

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for conflicts with approved bookings only
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validatedData.roomId,
        status: { in: ['approved', 'confirmed'] },
        OR: [
          {
            AND: [
              { startDatetime: { lte: startTime } },
              { endDatetime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startDatetime: { lt: endTime } },
              { endDatetime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startDatetime: { gte: startTime } },
              { endDatetime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Room is already booked for this time slot' },
        { status: 409 }
      )
    }

    // Validate refreshment data
    if (validatedData.needsRefreshment && !validatedData.refreshmentSets) {
      return NextResponse.json(
        { error: 'Number of refreshment sets is required when refreshment is needed' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        roomId: validatedData.roomId,
        title: validatedData.title,
        description: validatedData.description,
        startDatetime: startTime,
        endDatetime: endTime,
        createdBy: validatedData.createdBy,
        organizerId: validatedData.organizerId,
        needsRefreshment: validatedData.needsRefreshment,
        refreshmentSets: validatedData.needsRefreshment ? validatedData.refreshmentSets : null,
        refreshmentNote: validatedData.refreshmentNote,
        status: 'pending',
        participants: validatedData.participants ? {
          create: validatedData.participants
        } : undefined
      },
      include: {
        room: true,
        organizer: true,
        participants: true
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          message: errorMessage,
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}