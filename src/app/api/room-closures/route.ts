import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RoomClosureSchema = z.object({
  roomId: z.number(),
  startDatetime: z.string().datetime('Invalid datetime format'),
  endDatetime: z.string().datetime('Invalid datetime format'),
  reason: z.string().min(1, 'Reason is required').max(255),
  createdBy: z.string().min(1, 'Created by is required').max(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const roomId = searchParams.get('roomId')

    let whereClause: any = {}

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      whereClause.OR = [
        {
          startDatetime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        {
          endDatetime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        {
          AND: [
            { startDatetime: { lte: startOfDay } },
            { endDatetime: { gte: endOfDay } }
          ]
        }
      ]
    }

    if (roomId) {
      whereClause.roomId = parseInt(roomId)
    }

    const closures = await prisma.roomClosure.findMany({
      where: whereClause,
      include: {
        room: true
      },
      orderBy: {
        startDatetime: 'asc'
      }
    })

    return NextResponse.json(closures)
  } catch (error) {
    console.error('Error fetching room closures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room closures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RoomClosureSchema.parse(body)

    // Check for overlapping closures
    const overlappingClosure = await prisma.roomClosure.findFirst({
      where: {
        roomId: validatedData.roomId,
        OR: [
          {
            AND: [
              { startDatetime: { lte: new Date(validatedData.startDatetime) } },
              { endDatetime: { gte: new Date(validatedData.startDatetime) } }
            ]
          },
          {
            AND: [
              { startDatetime: { lte: new Date(validatedData.endDatetime) } },
              { endDatetime: { gte: new Date(validatedData.endDatetime) } }
            ]
          },
          {
            AND: [
              { startDatetime: { gte: new Date(validatedData.startDatetime) } },
              { endDatetime: { lte: new Date(validatedData.endDatetime) } }
            ]
          }
        ]
      }
    })

    if (overlappingClosure) {
      return NextResponse.json(
        { error: 'มีการปิดห้องในช่วงเวลาที่ทับซ้อนกันอยู่แล้ว' },
        { status: 400 }
      )
    }

    const closure = await prisma.roomClosure.create({
      data: {
        roomId: validatedData.roomId,
        startDatetime: new Date(validatedData.startDatetime),
        endDatetime: new Date(validatedData.endDatetime),
        reason: validatedData.reason,
        createdBy: validatedData.createdBy,
      },
      include: {
        room: true
      }
    })

    return NextResponse.json(closure, { status: 201 })
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

    console.error('Error creating room closure:', error)
    return NextResponse.json(
      { error: 'Failed to create room closure', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}