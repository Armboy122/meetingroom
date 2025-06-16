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

  // Seed Divisions
  const divisions = [
    { divisionName: 'กองบริหารและสนับสนุน' },
    { divisionName: 'กองเทคโนโลยีสารสนเทศ' },
    { divisionName: 'กองการเงินและบัญชี' },
    { divisionName: 'กองทรัพยากรบุคคล' },
    { divisionName: 'กองปฏิบัติการ' }
  ]

  const createdDivisions = []
  for (const division of divisions) {
    const existingDiv = await prisma.division.findFirst({
      where: { divisionName: division.divisionName }
    })
    
    const div = existingDiv || await prisma.division.create({
      data: division
    })
    createdDivisions.push(div)
  }

  // Seed Departments
  const departments = [
    { departmentName: 'แผนกบริหารงานทั่วไป', divisionName: 'กองบริหารและสนับสนุน' },
    { departmentName: 'แผนกการเงิน', divisionName: 'กองบริหารและสนับสนุน' },
    { departmentName: 'แผนกพัสดุและครุภัณฑ์', divisionName: 'กองบริหารและสนับสนุน' },
    
    { departmentName: 'แผนกพัฒนาระบบ', divisionName: 'กองเทคโนโลยีสารสนเทศ' },
    { departmentName: 'แผนกสนับสนุนเทคโนโลยี', divisionName: 'กองเทคโนโลยีสารสนเทศ' },
    { departmentName: 'แผนกความปลอดภัยไซเบอร์', divisionName: 'กองเทคโนโลยีสารสนเทศ' },
    
    { departmentName: 'แผนกบัญชี', divisionName: 'กองการเงินและบัญชี' },
    { departmentName: 'แผนกงบประมาณ', divisionName: 'กองการเงินและบัญชี' },
    
    { departmentName: 'แผนกสรรหาและบรรจุ', divisionName: 'กองทรัพยากรบุคคล' },
    { departmentName: 'แผนกพัฒนาบุคลากร', divisionName: 'กองทรัพยากรบุคคล' },
    
    { departmentName: 'แผนกปฏิบัติการภาคเหนือ', divisionName: 'กองปฏิบัติการ' },
    { departmentName: 'แผนกปฏิบัติการภาคใต้', divisionName: 'กองปฏิบัติการ' }
  ]

  const createdDepartments = []
  for (const dept of departments) {
    const division = createdDivisions.find(d => d.divisionName === dept.divisionName)
    if (division) {
      const existingDept = await prisma.department.findFirst({
        where: {
          departmentName: dept.departmentName,
          divisionId: division.divisionId
        }
      })
      
      const department = existingDept || await prisma.department.create({
        data: {
          departmentName: dept.departmentName,
          divisionId: division.divisionId
        }
      })
      createdDepartments.push(department)
    }
  }

  // Seed Sample Users
  const users = [
    { employeeId: 'EMP001', fullName: 'สมชาย ใจดี', departmentName: 'แผนกบริหารงานทั่วไป', email: 'somchai@company.com' },
    { employeeId: 'EMP002', fullName: 'สมหญิง รักษ์ดี', departmentName: 'แผนกพัฒนาระบบ', email: 'somying@company.com' },
    { employeeId: 'EMP003', fullName: 'วิชัย เก่งกาจ', departmentName: 'แผนกบัญชี', email: 'vichai@company.com' },
    { employeeId: 'EMP004', fullName: 'มาลี สวยงาม', departmentName: 'แผนกสรรหาและบรรจุ', email: 'malee@company.com' },
    { employeeId: 'EMP005', fullName: 'ประยุทธ์ มั่นคง', departmentName: 'แผนกปฏิบัติการภาคเหนือ', email: 'prayuth@company.com' }
  ]

  for (const user of users) {
    const department = createdDepartments.find(d => d.departmentName === user.departmentName)
    if (department) {
      await prisma.user.upsert({
        where: { employeeId: user.employeeId },
        update: {},
        create: {
          employeeId: user.employeeId,
          fullName: user.fullName,
          departmentId: department.departmentId,
          divisionId: department.divisionId,
          email: user.email
        }
      })
    }
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