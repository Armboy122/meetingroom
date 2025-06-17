import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // Seed Admin Settings
  await prisma.adminSettings.upsert({
    where: { settingKey: 'admin_password' },
    update: {},
    create: {
      settingKey: 'admin_password',
      settingValue: 'Armoff122*'
    }
  })

  // Seed Sample Users with new simplified structure
  const users = [
    { employeeId: '331980', fullName: 'นายสำราญ ขุนฤทธิ์', position: 'ผู้ช่วยผู้ว่าการ', department: 'ผชก.(ต3)/สชก.(ต3)', email: 'samran@company.com' },
    { employeeId: 'EMP001', fullName: 'สมชาย ใจดี', position: 'นักวิเคราะห์', department: 'แผนกบริหารงานทั่วไป', email: 'somchai@company.com' },
    { employeeId: 'EMP002', fullName: 'สมหญิง รักษ์ดี', position: 'นักพัฒนาระบบ', department: 'แผนกพัฒนาระบบ', email: 'somying@company.com' },
    { employeeId: 'EMP003', fullName: 'วิชัย เก่งกาจ', position: 'นักบัญชี', department: 'แผนกบัญชี', email: 'vichai@company.com' },
    { employeeId: 'EMP004', fullName: 'มาลี สวยงาม', position: 'นักทรัพยากรบุคคล', department: 'แผนกสรรหาและบรรจุ', email: 'malee@company.com' },
    { employeeId: 'EMP005', fullName: 'ประยุทธ์ มั่นคง', position: 'หัวหน้าปฏิบัติการ', department: 'แผนกปฏิบัติการภาคเหนือ', email: 'prayuth@company.com' }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { employeeId: user.employeeId },
      update: {},
      create: {
        employeeId: user.employeeId,
        fullName: user.fullName,
        position: user.position,
        department: user.department,
        email: user.email
      }
    })
  }

  // Seed Meeting Rooms
  const rooms = [
    { roomName: 'ห้องประชุมสยาม', capacity: 12, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด, ไมโครโฟน' },
    { roomName: 'ห้องประชุมกรุงเทพ', capacity: 8, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด' },
    { roomName: 'ห้องประชุมเชียงใหม่', capacity: 15, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด, ไมโครโฟน, ระบบเสียง' },
    { roomName: 'ห้องประชุมภูเก็ต', capacity: 6, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด' },
    { roomName: 'ห้องประชุมขอนแก่น', capacity: 10, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด, ไมโครโฟน' },
    { roomName: 'ห้องประชุมหาดใหญ่', capacity: 20, equipment: 'โปรเจคเตอร์, ไวท์บอร์ด, ไมโครโฟน, ระบบเสียง, กล้องวีดีโอ' }
  ]

  for (const room of rooms) {
    const existingRoom = await prisma.room.findFirst({
      where: { roomName: room.roomName }
    })
    
    if (!existingRoom) {
      await prisma.room.create({
        data: room
      })
    }
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })