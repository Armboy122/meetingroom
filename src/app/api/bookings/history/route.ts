import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // all, pending, approved, rejected
    const roomId = searchParams.get('roomId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where clause
    let whereClause: any = {}

    // Filter by status (include all by default)
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Filter by room
    if (roomId) {
      whereClause.roomId = parseInt(roomId)
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.startDatetime = {}
      if (startDate) {
        whereClause.startDatetime.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        whereClause.startDatetime.lte = endDateTime
      }
    }

    // Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          room: true,
          organizer: {
            include: {
              department: true,
              division: true
            }
          },
          participants: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.booking.count({
        where: whereClause
      })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching booking history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking history' },
      { status: 500 }
    )
  }
}