import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = 'Armoff122*'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'กรุณาใส่รหัสผ่าน' },
        { status: 400 }
      )
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: 'Authentication successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน' },
      { status: 500 }
    )
  }
}