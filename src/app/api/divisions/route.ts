import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateAdminPassword } from '@/lib/admin'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const divisions = await prisma.division.findMany({
      where: { status: 'active' },
      include: {
        departments: {
          where: { status: 'active' },
          select: {
            departmentId: true,
            departmentName: true
          }
        }
      },
      orderBy: { divisionName: 'asc' }
    })

    return NextResponse.json(divisions)
  } catch (error) {
    console.error('Error fetching divisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch divisions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { divisionName, adminPassword } = body

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

    const division = await prisma.division.create({
      data: {
        divisionName
      }
    })

    return NextResponse.json(division, { status: 201 })
  } catch (error) {
    console.error('Error creating division:', error)
    return NextResponse.json(
      { error: 'Failed to create division' },
      { status: 500 }
    )
  }
}