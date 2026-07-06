import { NextRequest, NextResponse } from 'next/server'
import { queryCollectionFromFirebase, setDocumentInFirebase, deleteDocumentFromFirebase, serverTimestamp } from '@/lib/firebase'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

async function getEventsFromFirebase() {
  try {
    const events = await queryCollectionFromFirebase('events')
    console.log('Loaded events from Firebase')
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
    console.log('Event saved to Firebase successfully')
    return { success: true }
  } catch (error) {
    console.error('Error saving event to Firebase:', error)
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

export async function GET() {
  try {
    const events = await getEventsFromFirebase()
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
      // Upload image to Cloudinary instead of skipping
      console.log('Uploading image to Cloudinary...')
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      const uploadResult = await uploadImageToCloudinary(file)
      
      if (uploadResult.success) {
        imageUrl = uploadResult.url || ''
        console.log('Image uploaded successfully:', imageUrl)
      } else {
        console.error('Cloudinary upload failed:', uploadResult.error)
        imageUrl = ''
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
      console.error('Firebase save failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload Error:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    })
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const result = await deleteEventFromFirebase(eventId)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Event deleted successfully' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
