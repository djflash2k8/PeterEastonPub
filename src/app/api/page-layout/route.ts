import { NextResponse } from 'next/server'

// Default page layout settings
const DEFAULT_LAYOUT = {
  showWelcome: true,
  showAbout: true,
  showOfferings: true,
  showNextEvent: true,
  showTags: true,
  layoutStyle: 'centered', // Options: 'centered', 'left-aligned', 'right-aligned', 'grid'
  welcomePosition: 'top', // Options: 'top', 'middle', 'bottom'
  aboutPosition: 'middle', // Options: 'top', 'middle', 'bottom'
  offeringsPosition: 'middle', // Options: 'top', 'middle', 'bottom'
  eventPosition: 'bottom', // Options: 'top', 'middle', 'bottom'
  tagsPosition: 'bottom', // Options: 'top', 'middle', 'bottom'
  spacing: 'normal', // Options: 'compact', 'normal', 'spacious'
  maxContentWidth: '1200px', // Options: '800px', '1000px', '1200px', 'full'
  sidebarEnabled: false,
  footerEnabled: true
}

// In-memory storage for serverless environment
let pageLayout: any = DEFAULT_LAYOUT
let layoutInitialized = false

async function initializeLayout() {
  if (layoutInitialized) return pageLayout
  
  // Try to get layout from environment variable first
  const envLayout = process.env.PAGE_LAYOUT
  if (envLayout) {
    try {
      pageLayout = JSON.parse(envLayout)
      console.log('Loaded layout from environment variable')
    } catch (error) {
      console.log('Failed to parse environment layout, using default:', error instanceof Error ? error.message : String(error))
      pageLayout = DEFAULT_LAYOUT
    }
  } else {
    // Try to read from file system for development
    if (process.env.NODE_ENV === 'development') {
      try {
        const { readFile } = require('fs/promises')
        const path = require('path')
        const LAYOUT_FILE = path.join(process.cwd(), 'data', 'page-layout.json')
        const data = await readFile(LAYOUT_FILE, 'utf-8')
        pageLayout = JSON.parse(data)
        console.log('Loaded layout from file system')
      } catch (error) {
        console.log('Development file read failed, using default:', error instanceof Error ? error.message : String(error))
        pageLayout = DEFAULT_LAYOUT
      }
    } else {
      console.log('No environment layout found, using default')
      pageLayout = DEFAULT_LAYOUT
    }
  }
  
  layoutInitialized = true
  return pageLayout
}

async function saveLayout(layout: any) {
  pageLayout = { ...layout, updatedAt: new Date().toISOString() }
  layoutInitialized = true
  
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
      
      const LAYOUT_FILE = path.join(process.cwd(), 'data', 'page-layout.json')
      await writeFile(LAYOUT_FILE, JSON.stringify(pageLayout, null, 2), 'utf-8')
      console.log('Successfully saved layout to file system')
      return { success: true, persisted: true, method: 'file-system' }
    } catch (error) {
      console.log('Development file save failed:', error instanceof Error ? error.message : String(error))
    }
  }
  
  // In production, we'll use in-memory storage
  console.log('Layout saved to memory for production')
  return { success: true, persisted: false, method: 'memory' }
}

export async function GET() {
  try {
    const layout = await initializeLayout()
    return NextResponse.json(layout)
  } catch (error) {
    console.error('GET handler error:', error)
    return NextResponse.json(DEFAULT_LAYOUT)
  }
}

export async function POST(request: Request) {
  try {
    const layoutData = await request.json()
    
    const result = await saveLayout(layoutData)
    
    return NextResponse.json({ 
      success: true, 
      message: result.method === 'file-system' 
        ? 'Layout saved successfully to file system' 
        : 'Layout saved to memory. In production, consider using a database for persistence.',
      persisted: result.persisted,
      method: result.method
    })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save layout' 
    }, { status: 500 })
  }
}
