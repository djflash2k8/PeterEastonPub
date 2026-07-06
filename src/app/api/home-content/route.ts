import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

const COLLECTION = 'home-content'
const DOC_ID = 'main'

const DEFAULT_CONTENT = {
  welcomeTitle: "Welcome to Peter Easton's Pub!",
  welcomeDescription: 'Your local destination for great entertainment and good times!',
  aboutTitle: 'About Us',
  aboutContent:
    "Located in the heart of St. John's, Peter Easton's Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!",
  whatWeOfferTitle: 'What We Offer',
  offerings: [
    { title: 'Live Entertainment', description: 'Regular live music performances and special events' },
    { title: 'Great Atmosphere',   description: 'Friendly staff and welcoming environment' },
  ],
  tags: ['Live Music', 'Karaoke', 'Open Mic'],
}

export async function GET() {
  try {
    const content = await getDocumentFromFirebase(COLLECTION, DOC_ID)
    return NextResponse.json(content ?? DEFAULT_CONTENT)
  } catch (error) {
    console.error('GET /api/home-content error:', error)
    return NextResponse.json(DEFAULT_CONTENT)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = { ...body, updatedAt: new Date().toISOString() }
    await setDocumentInFirebase(COLLECTION, DOC_ID, data)
    return NextResponse.json({ success: true, message: 'Home content saved successfully', persisted: true, method: 'firebase' })
  } catch (error) {
    console.error('POST /api/home-content error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save content' }, { status: 500 })
  }
}
