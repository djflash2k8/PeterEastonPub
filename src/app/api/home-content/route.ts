import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

// Default content for fallback
const DEFAULT_CONTENT = {
  welcomeTitle: 'Welcome to Peter Easton\'s Pub!',
  welcomeDescription: 'Your local destination for great entertainment and good times!',
  aboutTitle: 'About Us',
  aboutContent: 'Located in the heart of St. John\'s, Peter Easton\'s Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!',
  whatWeOfferTitle: 'What We Offer',
  offerings: [
    { title: 'Live Entertainment', description: 'Regular live music performances and special events' },
    { title: 'Great Atmosphere', description: 'Friendly staff and welcoming environment' }
  ],
  tags: ['Live Music', 'Karaoke', 'Open Mic']
}

// In-memory storage for serverless environment
let homeContent: any = DEFAULT_CONTENT
let contentInitialized = false

async function initializeContent() {
  if (contentInitialized) return homeContent
  
  // Try to get content from Firebase first
  try {
    const firebaseContent = await getDocumentFromFirebase('home-content', 'main')
    if (firebaseContent) {
      homeContent = firebaseContent
      console.log('Loaded content from Firebase (peweb database)')
    } else {
      homeContent = DEFAULT_CONTENT
      console.log('No Firebase content found, using default')
    }
  } catch (error) {
    console.log('Firebase read failed, using default:', error instanceof Error ? error.message : String(error))
    homeContent = DEFAULT_CONTENT
  }
  
  contentInitialized = true
  return homeContent
}

async function saveContent(content: any) {
  homeContent = { ...content, updatedAt: new Date().toISOString() }
  contentInitialized = true
  
  // Try to save to Firebase for persistence
  try {
    const result = await setDocumentInFirebase('home-content', 'main', homeContent)
    if (result) {
      console.log('Content saved to Firebase (peweb database)')
      return { success: true, persisted: true, method: 'firebase' }
    } else {
      console.log('Firebase save failed, using memory fallback')
      return { success: true, persisted: false, method: 'memory' }
    }
  } catch (error) {
    console.error('Failed to save content to Firebase:', error instanceof Error ? error.message : String(error))
    return { success: false, persisted: false, method: 'error' }
  }
}

export async function GET() {
  try {
    const content = await initializeContent()
    return NextResponse.json(content)
  } catch (error) {
    console.error('GET handler error:', error)
    return NextResponse.json(DEFAULT_CONTENT)
  }
}

export async function POST(request: Request) {
  try {
    const {
      welcomeTitle,
      welcomeDescription,
      aboutTitle,
      aboutContent,
      whatWeOfferTitle,
      offerings,
      tags
    } = await request.json()
    
    const newContent = {
      welcomeTitle,
      welcomeDescription,
      aboutTitle,
      aboutContent,
      whatWeOfferTitle,
      offerings,
      tags
    }
    
    const result = await saveContent(newContent)
    
    return NextResponse.json({ 
      success: true, 
      message: result.method === 'file-system' 
        ? 'Changes saved successfully to file system' 
        : 'Changes saved to memory. In production, consider using a database for persistence.',
      persisted: result.persisted,
      method: result.method
    })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save content' 
    }, { status: 500 })
  }
}
