import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        roomId: 'asc'
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                startDatetime: {
                  gte: new Date()
                }
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

// POST - สร้างห้องใหม่
export async function POST(request: NextRequest) {
  try {
    const { roomName, capacity, equipment, adminPassword } = await request.json()

    // ตรวจสอบรหัสผ่าน admin
    if (adminPassword !== 'Armoff122*') {
      return NextResponse.json({ error: 'รหัสผ่าน Admin ไม่ถูกต้อง' }, { status: 401 })
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!roomName || !capacity) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อห้องและจำนวนที่นั่ง' }, { status: 400 })
    }

    // ตรวจสอบว่าชื่อห้องซ้ำหรือไม่
    const existingRoom = await prisma.room.findFirst({
      where: { roomName }
    })

    if (existingRoom) {
      return NextResponse.json({ error: 'ชื่อห้องนี้ถูกใช้แล้ว' }, { status: 409 })
    }

    // สร้างห้องใหม่
    const newRoom = await prisma.room.create({
      data: {
        roomName,
        capacity: parseInt(capacity),
        equipment: Array.isArray(equipment) ? equipment.join(', ') : equipment,
        status: 'active'
      }
    })

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}