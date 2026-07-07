import { NextRequest, NextResponse } from 'next/server'
import { queryCollectionFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

async function getEventsFromFirebase() {
  try {
    const events = await queryCollectionFromFirebase('events')
    return events
  } catch (error) {
    console.error('Error loading events from Firebase:', error)
    return []
  }
}

async function saveEventToFirebase(eventData: any) {
  try {
    const eventWithTimestamp = { ...eventData, createdAt: serverTimestamp() }
    await setDocumentInFirebase('events', eventData.id, eventWithTimestamp)
    return { success: true }
  } catch (error) {
    console.error('Error saving event to Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let events = await getEventsFromFirebase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Handle Recurring Events Rotation
    events = events.map((event: any) => {
      if (event.isRecurring && event.date < todayStr) {
        // Calculate the next occurrence (same day of week)
        const eventDate = new Date(event.date + 'T00:00:00')
        const diff = today.getTime() - eventDate.getTime()
        const daysPassed = Math.ceil(diff / (1000 * 60 * 60 * 24))
        const weeksToAdd = Math.ceil(daysPassed / 7)
        
        const nextDate = new Date(eventDate)
        nextDate.setDate(eventDate.getDate() + (weeksToAdd * 7))
        
        return {
          ...event,
          date: nextDate.toISOString().split('T')[0]
        }
      }
      return event
    })

    // Sort by date (ascending), then by startTime (ascending)
    events.sort((a: any, b: any) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.startTime || '').localeCompare(b.startTime || '')
    })
    
    return new NextResponse(JSON.stringify(events), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string 
    const endTime = formData.get('endTime') as string     
    const description = formData.get('description') as string
    const isRecurring = formData.get('isRecurring') === 'true'
    const archived = formData.get('archived') === 'true'
    const file = formData.get('image') as File | null

    let imageUrl = formData.get('imageUrl') as string || ''

    // 2. Handle Image Upload to Cloudinary
    if (file && file.size > 0) {
      const uploadResult = await uploadImageToCloudinary(file)
      if (uploadResult.success) {
        imageUrl = uploadResult.url || ''
        
        // Save to Media Library as well
        const mediaId = Date.now().toString()
        await setDocumentInFirebase('media', mediaId, {
          id: mediaId,
          url: imageUrl,
          publicId: uploadResult.publicId,
          name: file.name,
          type: file.type,
          size: file.size,
          folder: 'events',
          createdAt: serverTimestamp()
        })
      } else {
        console.error('Cloudinary upload failed:', uploadResult.error)
      }
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      date,
      startTime,
      endTime,
      description,
      imageUrl,
      isRecurring,
      archived
    }

    const result = await saveEventToFirebase(newEvent)
    
    if (result.success) {
      return NextResponse.json(newEvent, { status: 201 })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
  }
}
