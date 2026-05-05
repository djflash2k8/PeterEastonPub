import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

const eventsFile = path.join(process.cwd(), 'src/lib/events.json')
const uploadDir = path.join(process.cwd(), 'public/uploads')

// In-memory storage for production (Vercel serverless)
let inMemoryEvents: any[] = []

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Load events from file system or memory
const loadEvents = () => {
  try {
    // Check if we're in development or if file exists
    if (process.env.NODE_ENV === 'development' && fs.existsSync(eventsFile)) {
      const data = fs.readFileSync(eventsFile, 'utf8')
      const events = JSON.parse(data)
      inMemoryEvents = events // Keep memory in sync
      return events
    } else {
      // Use in-memory storage for production or when file doesn't exist
      return inMemoryEvents
    }
  } catch (error) {
    console.error('Error loading events:', error)
    return inMemoryEvents
  }
}

// Save events to file system or memory
const saveEvents = (events: any[]) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Save to file system in development
      if (!fs.existsSync(path.dirname(eventsFile))) {
        fs.mkdirSync(path.dirname(eventsFile), { recursive: true })
      }
      fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
    }
    // Always update memory
    inMemoryEvents = events
  } catch (error) {
    console.error('Error saving events:', error)
    // At least save to memory
    inMemoryEvents = events
  }
}

export async function GET() {
  try {
    const events = loadEvents()
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
    const archived = formData.get('archived') === 'true'
    const file = formData.get('image') as File | null

    let imageUrl = formData.get('imageUrl') as string || ''

    if (file && file.size > 0) {
      // Validate file
      const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.php', '.asp', '.jsp'];
      const fileExtension = path.extname(file.name).toLowerCase();
      
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` 
        }, { status: 400 });
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
        }, { status: 400 });
      }
      
      // Check for dangerous file extensions
      if (dangerousExtensions.includes(fileExtension)) {
        return NextResponse.json({ 
          error: `File extension ${fileExtension} is not allowed` 
        }, { status: 400 });
      }
      
      // Check for path traversal attempts
      if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        return NextResponse.json({ 
          error: 'Invalid filename characters' 
        }, { status: 400 });
      }
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.\./g, '_')
        .replace(/\s+/g, '-')
      const fileName = `${Date.now()}-${sanitizedFileName}`
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
      isRecurring,
      archived
    }

    const events = loadEvents()
    events.push(newEvent)
    saveEvents(events)

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
  }
}