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
    const { adminPassword, rejectedReason, rejectedBy } = body
    const bookingId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!rejectedBy) {
      return NextResponse.json(
        { error: 'Rejector name is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { bookingId }
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

    // Reject booking
    const updatedBooking = await prisma.booking.update({
      where: { bookingId },
      data: {
        status: 'rejected',
        rejectedReason: rejectedReason || 'No reason provided',
        approvedBy: rejectedBy,
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
    console.error('Error rejecting booking:', error)
    return NextResponse.json(
      { error: 'Failed to reject booking' },
      { status: 500 }
    )
  }
}