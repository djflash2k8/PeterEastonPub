import { NextResponse } from 'next/server'

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
  
  // Try to get content from environment variable first
  const envContent = process.env.HOME_PAGE_CONTENT
  if (envContent) {
    try {
      homeContent = JSON.parse(envContent)
      console.log('Loaded content from environment variable')
    } catch (error) {
      console.log('Failed to parse environment content, using default:', error instanceof Error ? error.message : String(error))
      homeContent = DEFAULT_CONTENT
    }
  } else {
    // Try to read from file system for development
    if (process.env.NODE_ENV === 'development') {
      try {
        const { readFile } = require('fs/promises')
        const path = require('path')
        const CONTENT_FILE = path.join(process.cwd(), 'data', 'home-content.json')
        const data = await readFile(CONTENT_FILE, 'utf-8')
        homeContent = JSON.parse(data)
        console.log('Loaded content from file system')
      } catch (error) {
        console.log('Development file read failed, using default:', error instanceof Error ? error.message : String(error))
        homeContent = DEFAULT_CONTENT
      }
    } else {
      console.log('No environment content found, using default')
      homeContent = DEFAULT_CONTENT
    }
  }
  
  contentInitialized = true
  return homeContent
}

async function saveContent(content: any) {
  homeContent = { ...content, updatedAt: new Date().toISOString() }
  contentInitialized = true
  
  // In development, try to save to file system
  if (process.env.NODE_ENV === 'development') {
    try {
      const { writeFile } = require('fs/promises')
      const path = require('path')
      const fs = require('fs')
      
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      const CONTENT_FILE = path.join(process.cwd(), 'data', 'home-content.json')
      await writeFile(CONTENT_FILE, JSON.stringify(homeContent, null, 2), 'utf-8')
      console.log('Successfully saved to file system')
      return { success: true, persisted: true, method: 'file-system' }
    } catch (error) {
      console.log('Development file save failed:', error instanceof Error ? error.message : String(error))
    }
  }
  
  // In production, we'll use in-memory storage
  console.log('Content saved to memory for production')
  return { success: true, persisted: false, method: 'memory' }
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
