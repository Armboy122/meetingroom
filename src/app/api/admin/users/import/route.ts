import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    const content = Buffer.from(buffer).toString('utf-8')
    
    // Parse CSV content (assuming CSV format for simplicity)
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Validate headers
    const expectedHeaders = ['รหัส', 'ชื่อ - สกุล', 'ตำแหน่ง', 'สังกัด']
    const hasValidHeaders = expectedHeaders.every(header => 
      headers.some(h => h.includes(header))
    )

    if (!hasValidHeaders) {
      return NextResponse.json(
        { error: 'Invalid file format. Expected columns: รหัส, ชื่อ - สกุล, ตำแหน่ง, สังกัด' },
        { status: 400 }
      )
    }

    let imported = 0
    let updated = 0
    let errors: string[] = []

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length < 4) continue

      const [employeeId, fullName, position, department] = values

      if (!employeeId || !fullName) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { employeeId }
        })

        if (existingUser) {
          // Update if position or department changed
          if (existingUser.position !== position || existingUser.department !== department) {
            await prisma.user.update({
              where: { employeeId },
              data: {
                fullName,
                position: position || null,
                department: department || null
              }
            })
            updated++
          }
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              employeeId,
              fullName,
              position: position || null,
              department: department || null
            }
          })
          imported++
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      imported,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${imported + updated} records`
    })

  } catch (error) {
    console.error('Error importing users:', error)
    return NextResponse.json(
      { error: 'Failed to import users', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}