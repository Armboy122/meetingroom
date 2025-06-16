import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { adminPassword, approvedBy } = body
    const bookingId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'Approver name is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { room: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking is not in pending status' },
        { status: 400 }
      )
    }

    // Check for conflicts with approved bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: booking.roomId,
        status: 'approved',
        AND: [
          {
            OR: [
              {
                startDatetime: {
                  lt: booking.endDatetime,
                  gte: booking.startDatetime
                }
              },
              {
                endDatetime: {
                  gt: booking.startDatetime,
                  lte: booking.endDatetime
                }
              },
              {
                AND: [
                  { startDatetime: { lte: booking.startDatetime } },
                  { endDatetime: { gte: booking.endDatetime } }
                ]
              }
            ]
          }
        ]
      }
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with an approved booking' },
        { status: 409 }
      )
    }

    // Approve booking
    const updatedBooking = await prisma.booking.update({
      where: { bookingId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date()
      },
      include: {
        room: true,
        organizer: true,
        participants: true
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error approving booking:', error)
    return NextResponse.json(
      { error: 'Failed to approve booking' },
      { status: 500 }
    )
  }
}