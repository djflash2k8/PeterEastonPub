import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const hoursFile = path.join(process.cwd(), 'src/lib/hours.json')

// Default hours data structure
const defaultHours = {
  monday: { open: '10:00', close: '02:00', closed: false },
  tuesday: { open: '10:00', close: '02:00', closed: false },
  wednesday: { open: '10:00', close: '02:00', closed: false },
  thursday: { open: '10:00', close: '03:00', closed: false },
  friday: { open: '10:00', close: '03:00', closed: false },
  saturday: { open: '10:00', close: '03:00', closed: false },
  sunday: { open: '10:00', close: '03:00', closed: false }
}

// Ensure hours file exists
if (!fs.existsSync(hoursFile)) {
  fs.writeFileSync(hoursFile, JSON.stringify(defaultHours, null, 2))
}

export async function GET() {
  try {
    const data = fs.readFileSync(hoursFile, 'utf8')
    const hours = JSON.parse(data)
    return NextResponse.json(hours)
  } catch (error) {
    return NextResponse.json(defaultHours)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the structure
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (const day of days) {
      if (!body[day] || typeof body[day] !== 'object') {
        return NextResponse.json({ error: `Invalid data for ${day}` }, { status: 400 })
      }
      
      const dayData = body[day]
      if (typeof dayData.closed !== 'boolean' || 
          (dayData.closed === false && (!dayData.open || !dayData.close))) {
        return NextResponse.json({ error: `Invalid hours data for ${day}` }, { status: 400 })
      }
    }
    
    fs.writeFileSync(hoursFile, JSON.stringify(body, null, 2))
    return NextResponse.json({ message: 'Hours updated successfully', hours: body })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hours' }, { status: 500 })
  }
}
