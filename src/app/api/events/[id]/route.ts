import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const eventsFile = path.join(process.cwd(), 'src/lib/events.json')

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = request.url.split('/').pop()
    
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const description = formData.get('description') as string
    const isRecurring = formData.get('isRecurring') === 'true'
    const file = formData.get('image') as File | null
    let imageUrl = formData.get('imageUrl') as string || ''

    // Handle file upload if provided
    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const filePath = path.join(uploadDir, fileName)
      await fs.promises.writeFile(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }

    // Read existing events
    const data = fs.readFileSync(eventsFile, 'utf8')
    const events = JSON.parse(data)
    
    // Find and update the event
    const eventIndex = events.findIndex((event: any) => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    events[eventIndex] = {
      ...events[eventIndex],
      title,
      date,
      startTime,
      endTime,
      description,
      imageUrl: imageUrl || events[eventIndex].imageUrl,
      isRecurring
    }

    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
    return NextResponse.json(events[eventIndex])
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Read existing events
    const data = fs.readFileSync(eventsFile, 'utf8')
    const events = JSON.parse(data)
    
    // Find and remove the event
    const eventIndex = events.findIndex((event: any) => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const deletedEvent = events[eventIndex]
    events.splice(eventIndex, 1)
    
    // Write updated events back to file
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
    
    return NextResponse.json({ message: 'Event deleted successfully', event: deletedEvent })
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
