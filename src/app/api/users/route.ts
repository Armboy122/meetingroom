import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'active' },
      include: {
        department: {
          select: {
            departmentId: true,
            departmentName: true
          }
        },
        division: {
          select: {
            divisionId: true,
            divisionName: true
          }
        }
      },
      orderBy: [
        { division: { divisionName: 'asc' } },
        { department: { departmentName: 'asc' } },
        { fullName: 'asc' }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, fullName, departmentId, divisionId, email, adminPassword } = body

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

    // Check if employee ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { employeeId }
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

    const user = await prisma.user.create({
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

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}