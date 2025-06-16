import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { employeeId, fullName, departmentId, divisionId, email, adminPassword } = body
    const userId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!employeeId || !fullName || !departmentId || !divisionId) {
      return NextResponse.json(
        { error: 'Employee ID, full name, department ID, and division ID are required' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: {
        employeeId,
        NOT: { userId }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Verify department belongs to division
    const department = await prisma.department.findFirst({
      where: {
        departmentId,
        divisionId
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Department does not belong to the specified division' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { userId },
      data: {
        employeeId,
        fullName,
        departmentId,
        divisionId,
        email
      },
      include: {
        department: true,
        division: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { adminPassword } = body
    const userId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has bookings
    const userBookings = await prisma.booking.findMany({
      where: { organizerId: userId }
    })

    if (userBookings.length > 0) {
      // Soft delete - set status to inactive
      const user = await prisma.user.update({
        where: { userId },
        data: { status: 'inactive' }
      })
      return NextResponse.json({ message: 'User deactivated successfully', user })
    } else {
      // Hard delete
      await prisma.user.delete({
        where: { userId }
      })
      return NextResponse.json({ message: 'User deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}