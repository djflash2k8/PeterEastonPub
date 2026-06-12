import { NextRequest, NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, deleteDocumentFromFirebase, serverTimestamp } from '@/lib/firebase'

async function getEventFromFirebase(eventId: string) {
  try {
    const eventDoc = await getDocumentFromFirebase('events', eventId)
    if (eventDoc) {
      console.log('Loaded event from Firebase')
      return { id: eventId, ...eventDoc }
    } else {
      console.log('Event not found in Firebase')
      return null
    }
  } catch (error) {
    console.error('Error loading event from Firebase:', error)
    return null
  }
}

async function updateEventInFirebase(eventId: string, eventData: any) {
  try {
    const eventWithTimestamp = { ...eventData, updatedAt: serverTimestamp() }
    await setDocumentInFirebase('events', eventId, eventWithTimestamp)
    console.log('Event updated in Firebase successfully')
    return { success: true }
  } catch (error) {
    console.error('Error updating event in Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function deleteEventFromFirebase(eventId: string) {
  try {
    await deleteDocumentFromFirebase('events', eventId)
    console.log('Event deleted from Firebase successfully')
    return { success: true }
  } catch (error) {
    console.error('Error deleting event from Firebase:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = request.url.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const description = formData.get('description') as string
    const isRecurring = formData.get('isRecurring') === 'true'
    const archived = formData.get('archived') === 'true'
    const file = formData.get('image') as File | null
    let imageUrl = formData.get('imageUrl') as string || ''

    // Handle file upload if provided (skip for serverless)
    if (file && file.size > 0) {
      console.log('File upload skipped in serverless environment')
      // Keep existing imageUrl
    }

    // Get existing event first
    const existingEvent = await getEventFromFirebase(id)
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
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

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Check if event exists first
    const existingEvent = await getEventFromFirebase(id)
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const result = await deleteEventFromFirebase(id)
    
    if (result.success) {
      return NextResponse.json({ message: 'Event deleted successfully', event: existingEvent })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
