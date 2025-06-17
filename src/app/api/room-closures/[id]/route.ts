import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RoomClosureUpdateSchema = z.object({
  roomId: z.number().optional(),
  startDatetime: z.string().datetime('Invalid datetime format').optional(),
  endDatetime: z.string().datetime('Invalid datetime format').optional(),
  reason: z.string().min(1, 'Reason is required').max(255).optional(),
  createdBy: z.string().min(1, 'Created by is required').max(100).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const closure = await prisma.roomClosure.findUnique({
      where: { closureId: params.id },
      include: { room: true }
    })

    if (!closure) {
      return NextResponse.json(
        { error: 'Room closure not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(closure)
  } catch (error) {
    console.error('Error fetching room closure:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room closure' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = RoomClosureUpdateSchema.parse(body)

    // Check if closure exists
    const existingClosure = await prisma.roomClosure.findUnique({
      where: { closureId: params.id }
    })

    if (!existingClosure) {
      return NextResponse.json(
        { error: 'Room closure not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.roomId !== undefined) {
      updateData.roomId = validatedData.roomId
    }
    if (validatedData.startDatetime !== undefined) {
      updateData.startDatetime = new Date(validatedData.startDatetime)
    }
    if (validatedData.endDatetime !== undefined) {
      updateData.endDatetime = new Date(validatedData.endDatetime)
    }
    if (validatedData.reason !== undefined) {
      updateData.reason = validatedData.reason
    }
    if (validatedData.createdBy !== undefined) {
      updateData.createdBy = validatedData.createdBy
    }

    // Validate time range if both dates are provided
    const startTime = updateData.startDatetime || existingClosure.startDatetime
    const endTime = updateData.endDatetime || existingClosure.endDatetime

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for overlapping closures (excluding current closure)
    const overlappingClosure = await prisma.roomClosure.findFirst({
      where: {
        closureId: { not: params.id },
        roomId: updateData.roomId || existingClosure.roomId,
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

    if (overlappingClosure) {
      return NextResponse.json(
        { error: 'มีการปิดห้องในช่วงเวลาที่ทับซ้อนกันอยู่แล้ว' },
        { status: 400 }
      )
    }

    const closure = await prisma.roomClosure.update({
      where: { closureId: params.id },
      data: updateData,
      include: { room: true }
    })

    return NextResponse.json(closure)
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

    console.error('Error updating room closure:', error)
    return NextResponse.json(
      { error: 'Failed to update room closure', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if closure exists
    const existingClosure = await prisma.roomClosure.findUnique({
      where: { closureId: params.id }
    })

    if (!existingClosure) {
      return NextResponse.json(
        { error: 'Room closure not found' },
        { status: 404 }
      )
    }

    await prisma.roomClosure.delete({
      where: { closureId: params.id }
    })

    return NextResponse.json({ message: 'Room closure deleted successfully' })
  } catch (error) {
    console.error('Error deleting room closure:', error)
    return NextResponse.json(
      { error: 'Failed to delete room closure', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}