import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAdminPassword(): Promise<string> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { settingKey: 'admin_password' }
    })
    return setting?.settingValue || 'Armoff122*' // Default password
  } catch (error) {
    console.error('Error getting admin password:', error)
    return 'Armoff122*' // Fallback to default
  }
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  const adminPassword = await getAdminPassword()
  return password === adminPassword
}