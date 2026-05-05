import { NextResponse } from 'next/server'

// Default global styling settings
const DEFAULT_STYLING = {
  backgroundColor: '#36454F', // Charcoal grey
  primaryTextColor: '#FFD700', // Gold
  secondaryTextColor: '#FFD700', // Gold
  accentTextColor: '#FFD700', // Gold
  altTextColor: '#FFFFFF', // White
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  borderRadius: '8px',
  padding: '16px'
}

// In-memory storage for serverless environment
let globalStyling: any = DEFAULT_STYLING
let stylingInitialized = false

async function initializeStyling() {
  if (stylingInitialized) return globalStyling
  
  // Try to get styling from environment variable first
  const envStyling = process.env.GLOBAL_STYLING
  if (envStyling) {
    try {
      globalStyling = JSON.parse(envStyling)
      console.log('Loaded styling from environment variable')
    } catch (error) {
      console.log('Failed to parse environment styling, using default:', error instanceof Error ? error.message : String(error))
      globalStyling = DEFAULT_STYLING
    }
  } else {
    // Try to read from file system for development
    if (process.env.NODE_ENV === 'development') {
      try {
        const { readFile } = require('fs/promises')
        const path = require('path')
        const STYLING_FILE = path.join(process.cwd(), 'data', 'global-styling.json')
        const data = await readFile(STYLING_FILE, 'utf-8')
        globalStyling = JSON.parse(data)
        console.log('Loaded styling from file system')
      } catch (error) {
        console.log('Development file read failed, using default:', error instanceof Error ? error.message : String(error))
        globalStyling = DEFAULT_STYLING
      }
    } else {
      console.log('No environment styling found, using default')
      globalStyling = DEFAULT_STYLING
    }
  }
  
  stylingInitialized = true
  return globalStyling
}

async function saveStyling(styling: any) {
  globalStyling = { ...styling, updatedAt: new Date().toISOString() }
  stylingInitialized = true
  
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
      
      const STYLING_FILE = path.join(process.cwd(), 'data', 'global-styling.json')
      await writeFile(STYLING_FILE, JSON.stringify(globalStyling, null, 2), 'utf-8')
      console.log('Successfully saved styling to file system')
      return { success: true, persisted: true, method: 'file-system' }
    } catch (error) {
      console.log('Development file save failed:', error instanceof Error ? error.message : String(error))
    }
  }
  
  // In production, we'll use in-memory storage
  console.log('Styling saved to memory for production')
  return { success: true, persisted: false, method: 'memory' }
}

export async function GET() {
  try {
    const styling = await initializeStyling()
    return NextResponse.json(styling)
  } catch (error) {
    console.error('GET handler error:', error)
    return NextResponse.json(DEFAULT_STYLING)
  }
}

export async function POST(request: Request) {
  try {
    const stylingData = await request.json()
    
    const result = await saveStyling(stylingData)
    
    return NextResponse.json({ 
      success: true, 
      message: result.method === 'file-system' 
        ? 'Styling saved successfully to file system' 
        : 'Styling saved to memory. In production, consider using a database for persistence.',
      persisted: result.persisted,
      method: result.method
    })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save styling' 
    }, { status: 500 })
  }
}
