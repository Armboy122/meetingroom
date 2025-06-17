import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UserUpdateSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email('Invalid email format').optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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
    const validatedData = UserUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if employee ID already exists (if being updated)
    if (validatedData.employeeId && validatedData.employeeId !== existingUser.employeeId) {
      const duplicateUser = await prisma.user.findUnique({
        where: { employeeId: validatedData.employeeId }
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 409 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { userId: params.id },
      data: validatedData
    })

    return NextResponse.json(user)
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

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has bookings
    const bookingCount = await prisma.booking.count({
      where: { organizerId: params.id }
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing bookings. Please transfer or remove bookings first.' },
        { status: 409 }
      )
    }

    await prisma.user.delete({
      where: { userId: params.id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}