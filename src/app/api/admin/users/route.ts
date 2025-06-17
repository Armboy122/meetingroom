import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UserSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email('Invalid email format').optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let where = {}
    
    if (search) {
      where = {
        OR: [
          { employeeId: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [
        { employeeId: 'asc' }
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
    const validatedData = UserSchema.parse(body)

    // Check if employee ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { employeeId: validatedData.employeeId }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        employeeId: validatedData.employeeId,
        fullName: validatedData.fullName,
        position: validatedData.position,
        department: validatedData.department,
        email: validatedData.email
      }
    })

    return NextResponse.json(user, { status: 201 })
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

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}