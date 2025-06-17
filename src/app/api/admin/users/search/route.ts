import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json([])
    }

    // Search users by employee ID (partial match) and full name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { employeeId: { startsWith: query, mode: 'insensitive' } },
          { employeeId: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } }
        ],
        status: 'active'
      },
      select: {
        userId: true,
        employeeId: true,
        fullName: true,
        position: true,
        department: true
      },
      orderBy: [
        // Prioritize exact prefix matches
        { employeeId: 'asc' }
      ],
      take: limit
    })

    // Sort results to prioritize employee ID prefix matches
    const sortedUsers = users.sort((a, b) => {
      const aStartsWithQuery = a.employeeId.toLowerCase().startsWith(query.toLowerCase())
      const bStartsWithQuery = b.employeeId.toLowerCase().startsWith(query.toLowerCase())
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1
      if (!aStartsWithQuery && bStartsWithQuery) return 1
      
      return a.employeeId.localeCompare(b.employeeId)
    })

    return NextResponse.json(sortedUsers)
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}