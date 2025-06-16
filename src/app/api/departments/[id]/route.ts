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
    const { departmentName, divisionId, adminPassword } = body
    const departmentId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!departmentName || !divisionId) {
      return NextResponse.json(
        { error: 'Department name and division ID are required' },
        { status: 400 }
      )
    }

    // Check if department name already exists in the same division for another department
    const existingDepartment = await prisma.department.findFirst({
      where: {
        departmentName,
        divisionId,
        NOT: { departmentId }
      }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department name already exists in this division' },
        { status: 400 }
      )
    }

    // Verify division exists
    const division = await prisma.division.findUnique({
      where: { divisionId }
    })

    if (!division) {
      return NextResponse.json(
        { error: 'Division not found' },
        { status: 404 }
      )
    }

    const department = await prisma.department.update({
      where: { departmentId },
      data: {
        departmentName,
        divisionId
      },
      include: {
        division: true,
        users: true
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
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
    const departmentId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if department has users
    const departmentWithUsers = await prisma.department.findUnique({
      where: { departmentId },
      include: {
        users: true
      }
    })

    if (!departmentWithUsers) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    if (departmentWithUsers.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department that has users. Please move or delete users first.' },
        { status: 400 }
      )
    }

    // Delete the department
    await prisma.department.delete({
      where: { departmentId }
    })

    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}