import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูลห้องประชุมเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({
      where: { roomId },
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

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - แก้ไขข้อมูลห้องประชุม
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 })
    }

    const { roomName, capacity, equipment, adminPassword } = await request.json()

    // ตรวจสอบรหัสผ่าน admin
    if (adminPassword !== 'Armoff122*') {
      return NextResponse.json({ error: 'รหัสผ่าน Admin ไม่ถูกต้อง' }, { status: 401 })
    }

    // ตรวจสอบว่าห้องมีอยู่จริง
    const existingRoom = await prisma.room.findUnique({
      where: { roomId }
    })

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // ตรวจสอบว่าชื่อห้องซ้ำกับห้องอื่นหรือไม่
    const duplicateRoom = await prisma.room.findFirst({
      where: {
        roomName,
        roomId: {
          not: roomId
        }
      }
    })

    if (duplicateRoom) {
      return NextResponse.json({ error: 'ชื่อห้องนี้ถูกใช้แล้ว' }, { status: 409 })
    }

    // อัพเดตห้อง
    const updatedRoom = await prisma.room.update({
      where: { roomId },
      data: {
        roomName,
        capacity: parseInt(capacity),
        equipment: Array.isArray(equipment) ? equipment.join(', ') : equipment,
      }
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - ลบห้องประชุม
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = parseInt(params.id)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 })
    }

    const { adminPassword } = await request.json()

    // ตรวจสอบรหัสผ่าน admin
    if (adminPassword !== 'Armoff122*') {
      return NextResponse.json({ error: 'รหัสผ่าน Admin ไม่ถูกต้อง' }, { status: 401 })
    }

    // ตรวจสอบว่าห้องมีอยู่จริง
    const existingRoom = await prisma.room.findUnique({
      where: { roomId }
    })

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // ตรวจสอบว่ามีการจองในอนาคตหรือไม่
    const futureBookings = await prisma.booking.findMany({
      where: {
        roomId,
        startDatetime: {
          gte: new Date()
        }
      }
    })

    if (futureBookings.length > 0) {
      return NextResponse.json({ 
        error: `ไม่สามารถลบห้องได้ เนื่องจากมีการจองในอนาคต ${futureBookings.length} รายการ` 
      }, { status: 409 })
    }

    // ลบห้องด้วย transaction
    await prisma.$transaction(async (tx) => {
      // ลบประวัติการจองเก่า
      await tx.participant.deleteMany({
        where: {
          booking: {
            roomId
          }
        }
      })

      await tx.booking.deleteMany({
        where: { roomId }
      })

      // ลบห้อง
      await tx.room.delete({
        where: { roomId }
      })
    })

    return NextResponse.json({ message: 'ลบห้องประชุมสำเร็จ' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 