import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

const COLLECTION = 'site-config'
const DOC_ID = 'hours'

const defaultHours = {
  monday:    { open: '10:00', close: '02:00', closed: false },
  tuesday:   { open: '10:00', close: '02:00', closed: false },
  wednesday: { open: '10:00', close: '02:00', closed: false },
  thursday:  { open: '10:00', close: '03:00', closed: false },
  friday:    { open: '10:00', close: '03:00', closed: false },
  saturday:  { open: '10:00', close: '03:00', closed: false },
  sunday:    { open: '10:00', close: '03:00', closed: false },
}

export async function GET() {
  try {
    const data = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(data ?? defaultHours)
  } catch (error) {
    return NextResponse.json(defaultHours)
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (const day of days) {
      if (!body[day] || typeof body[day] !== 'object') {
        return NextResponse.json({ error: `Invalid data for ${day}` }, { status: 400 })
      }
      const d = body[day]
      if (typeof d.closed !== 'boolean' || (d.closed === false && (!d.open || !d.close))) {
        return NextResponse.json({ error: `Invalid hours data for ${day}` }, { status: 400 })
      }
    }

    await setDocumentInFirebase(COLLECTION, DOC_ID, body)
    return NextResponse.json({ message: 'Hours updated successfully', hours: body })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hours' }, { status: 500 })
  }
}
