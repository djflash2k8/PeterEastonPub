import { NextRequest, NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, deleteDocumentFromFirebase, serverTimestamp } from '@/lib/firebase'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

async function getEventFromFirebase(eventId: string) {
  try {
    const eventDoc = await getDocumentFromFirebase('events', eventId)
    if (eventDoc) {
      return { id: eventId, ...eventDoc }
    }
    return null
  } catch (error) {
    console.error('Error loading event from Firebase:', error)
    return null
  }
}

async function updateEventInFirebase(eventId: string, eventData: any) {
  try {
    const eventWithTimestamp = { ...eventData, updatedAt: serverTimestamp() }
    await setDocumentInFirebase('events', eventId, eventWithTimestamp)
    return { success: true }
  } catch (error) {
    console.error('Error updating event in Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Await params as per Next.js 15+ requirements
    const resolvedParams = await (params as any)
    const id = resolvedParams.id
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
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

    // Get existing event first
    const existingEvent = await getEventFromFirebase(id)
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

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

    // Update event data
    const updatedEvent = {
      ...existingEvent,
      title,
      date,
      startTime,
      endTime,
      description,
      imageUrl: imageUrl || (existingEvent as any).imageUrl,
      isRecurring,
      archived
    }

    const result = await updateEventInFirebase(id, updatedEvent)
    
    if (result.success) {
      return NextResponse.json(updatedEvent)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Await params as per Next.js 15+ requirements
    const resolvedParams = await (params as any)
    const id = resolvedParams.id
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check if event exists first
    const existingEvent = await getEventFromFirebase(id)
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const result = await deleteDocumentFromFirebase('events', id)
    
    if (result) {
      return NextResponse.json({ message: 'Event deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
