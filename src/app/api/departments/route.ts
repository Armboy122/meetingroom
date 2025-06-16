import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const divisionId = searchParams.get('divisionId')

    const whereClause = {
      status: 'active',
      ...(divisionId && { divisionId })
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      include: {
        division: {
          select: {
            divisionId: true,
            divisionName: true
          }
        }
      },
      orderBy: { departmentName: 'asc' }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { departmentName, divisionId, adminPassword } = body

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

    const department = await prisma.department.create({
      data: {
        departmentName,
        divisionId
      },
      include: {
        division: true
      }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}