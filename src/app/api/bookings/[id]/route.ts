import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงรายละเอียดการจองเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        room: true,
        participants: {
          select: {
            participantName: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - แก้ไขการจอง
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    const { bookingTitle, description, participants } = await request.json()

    // ตรวจสอบว่าการจองมีอยู่จริง
    const existingBooking = await prisma.booking.findUnique({
      where: { bookingId },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // อัพเดตการจองด้วย transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // ลบผู้เข้าร่วมเดิม
      await tx.participant.deleteMany({
        where: { bookingId },
      })

      // อัพเดตการจอง
      const booking = await tx.booking.update({
        where: { bookingId },
        data: {
          title: bookingTitle,
          description,
        },
      })

      // เพิ่มผู้เข้าร่วมใหม่
      if (participants && participants.length > 0) {
        await tx.participant.createMany({
          data: participants.map((participant: { participantName: string }) => ({
            bookingId,
            participantName: participant.participantName,
          })),
        })
      }

      return booking
    })

    // ดึงการจองที่อัพเดตแล้วพร้อมข้อมูลที่เกี่ยวข้อง
    const fullBooking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        room: true,
        participants: {
          select: {
            participantName: true,
          },
        },
      },
    })

    return NextResponse.json(fullBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - ลบการจอง
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id

    // ตรวจสอบว่าการจองมีอยู่จริง
    const existingBooking = await prisma.booking.findUnique({
      where: { bookingId },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ลบการจองด้วย transaction (ลบผู้เข้าร่วมก่อน)
    await prisma.$transaction(async (tx) => {
      // ลบผู้เข้าร่วม
      await tx.participant.deleteMany({
        where: { bookingId },
      })

      // ลบการจอง
      await tx.booking.delete({
        where: { bookingId },
      })
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 