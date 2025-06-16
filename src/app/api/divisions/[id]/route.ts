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
    const { divisionName, adminPassword } = body
    const divisionId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!divisionName) {
      return NextResponse.json(
        { error: 'Division name is required' },
        { status: 400 }
      )
    }

    // Check if division name already exists for another division
    const existingDivision = await prisma.division.findFirst({
      where: {
        divisionName,
        NOT: { divisionId }
      }
    })

    if (existingDivision) {
      return NextResponse.json(
        { error: 'Division name already exists' },
        { status: 400 }
      )
    }

    const division = await prisma.division.update({
      where: { divisionId },
      data: {
        divisionName
      },
      include: {
        departments: true
      }
    })

    return NextResponse.json(division)
  } catch (error) {
    console.error('Error updating division:', error)
    return NextResponse.json(
      { error: 'Failed to update division' },
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
    const divisionId = params.id

    const isValidPassword = await validateAdminPassword(adminPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if division has departments
    const divisionWithDepartments = await prisma.division.findUnique({
      where: { divisionId },
      include: {
        departments: {
          include: {
            users: true
          }
        }
      }
    })

    if (!divisionWithDepartments) {
      return NextResponse.json(
        { error: 'Division not found' },
        { status: 404 }
      )
    }

    // Check if division has departments or users
    const hasUsers = divisionWithDepartments.departments.some(dept => dept.users.length > 0)
    
    if (divisionWithDepartments.departments.length > 0 || hasUsers) {
      return NextResponse.json(
        { error: 'Cannot delete division that has departments or users. Please move or delete them first.' },
        { status: 400 }
      )
    }

    // Delete the division
    await prisma.division.delete({
      where: { divisionId }
    })

    return NextResponse.json({ message: 'Division deleted successfully' })
  } catch (error) {
    console.error('Error deleting division:', error)
    return NextResponse.json(
      { error: 'Failed to delete division' },
      { status: 500 }
    )
  }
}