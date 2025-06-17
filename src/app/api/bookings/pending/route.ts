import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('adminPassword')

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is required' },
        { status: 400 }
      )
    }

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: 'pending'
      },
      include: {
        room: true,
        organizer: true,
        participants: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(pendingBookings)
  } catch (error) {
    console.error('Error fetching pending bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending bookings' },
      { status: 500 }
    )
  }
}