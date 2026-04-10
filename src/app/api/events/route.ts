import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

const eventsFile = path.join(process.cwd(), 'src/lib/events.json')
const uploadDir = path.join(process.cwd(), 'public/uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export async function GET() {
  try {
    const data = fs.readFileSync(eventsFile, 'utf8')
    const events = JSON.parse(data)
    // Sort by date (ascending), then by startTime (ascending)
    events.sort((a: any, b: any) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // 1. FIX: Match names to frontend ('startTime' and 'endTime')
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string 
    const endTime = formData.get('endTime') as string     
    const description = formData.get('description') as string
    const isRecurring = formData.get('isRecurring') === 'true'
    const file = formData.get('image') as File | null

    let imageUrl = formData.get('imageUrl') as string || ''

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      date,
      startTime, // Fixed key name
      endTime,   // Fixed key name
      description,
      imageUrl,
      isRecurring
    }

    const data = fs.readFileSync(eventsFile, 'utf8')
    const events = JSON.parse(data)
    events.push(newEvent)
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
  }
}