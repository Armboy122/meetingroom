import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getAdminPassword() {
  const setting = await prisma.adminSettings.findUnique({
    where: { settingKey: 'admin_password' }
  })
  return setting?.settingValue || 'Armoff122*' // Default password
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    const currentAdminPassword = await getAdminPassword()

    if (currentPassword !== currentAdminPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Update admin password
    await prisma.adminSettings.upsert({
      where: { settingKey: 'admin_password' },
      update: { settingValue: newPassword },
      create: {
        settingKey: 'admin_password',
        settingValue: newPassword
      }
    })

    return NextResponse.json({ message: 'Admin password updated successfully' })
  } catch (error) {
    console.error('Error updating admin password:', error)
    return NextResponse.json(
      { error: 'Failed to update admin password' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const currentAdminPassword = await getAdminPassword()
    const isValid = password === currentAdminPassword

    return NextResponse.json({ isValid })
  } catch (error) {
    console.error('Error validating admin password:', error)
    return NextResponse.json(
      { error: 'Failed to validate password' },
      { status: 500 }
    )
  }
}