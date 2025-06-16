import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const rooms = [
    {
      roomName: "ห้องประชุมสยาม",
      capacity: 12,
      equipment: "โปรเจคเตอร์, กระดานไวท์บอร์ด, ระบบเสียง, Wi-Fi",
      status: "active"
    },
    {
      roomName: "ห้องประชุมกรุงเทพ",
      capacity: 8,
      equipment: "TV 55นิ้ว, กระดานไวท์บอร์ด, Wi-Fi",
      status: "active"
    },
    {
      roomName: "ห้องประชุมเชียงใหม่",
      capacity: 16,
      equipment: "โปรเจคเตอร์, ระบบประชุมทางไกล, กระดานไวท์บอร์ด, Wi-Fi",
      status: "active"
    },
    {
      roomName: "ห้องประชุมภูเก็ต",
      capacity: 6,
      equipment: "TV 43นิ้ว, Wi-Fi",
      status: "active"
    },
    {
      roomName: "ห้องประชุมพัทยา",
      capacity: 20,
      equipment: "โปรเจคเตอร์ 2 เครื่อง, ระบบเสียงขนาดใหญ่, กระดานไวท์บอร์ด 2 อัน, Wi-Fi",
      status: "active"
    },
    {
      roomName: "ห้องประชุมเกาะสมุย",
      capacity: 4,
      equipment: "Monitor 32นิ้ว, Wi-Fi",
      status: "active"
    }
  ]

  console.log('🌱 เริ่มการ seed ข้อมูล...')

  for (const room of rooms) {
    const created = await prisma.room.create({
      data: room
    })
    console.log(`✅ สร้างห้องประชุม: ${created.roomName}`)
  }

  console.log('🎉 Seed ข้อมูลเสร็จสิ้น!')
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })