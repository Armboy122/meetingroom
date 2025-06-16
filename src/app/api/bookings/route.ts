import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BookingSchema = z.object({
  roomId: z.number(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
  createdBy: z.string().min(1).max(100),
  participants: z.array(z.object({
    participantName: z.string().min(1).max(100),
    participantEmail: z.string().email().optional()
  })).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const roomId = searchParams.get('roomId')

    let whereClause: any = {
      status: 'confirmed'
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

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: validatedData.roomId,
        status: 'confirmed',
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

    const booking = await prisma.booking.create({
      data: {
        roomId: validatedData.roomId,
        title: validatedData.title,
        description: validatedData.description,
        startDatetime: startTime,
        endDatetime: endTime,
        createdBy: validatedData.createdBy,
        participants: validatedData.participants ? {
          create: validatedData.participants
        } : undefined
      },
      include: {
        room: true,
        participants: true
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}