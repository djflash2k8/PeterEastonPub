import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

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

async function getStylingFromFirebase() {
  try {
    const stylingDoc = await getDocumentFromFirebase('global-styling', 'styling')
    if (stylingDoc) {
      console.log('Loaded styling from Firebase')
      return stylingDoc
    } else {
      console.log('No styling found in Firebase, using default')
      return DEFAULT_STYLING
    }
  } catch (error) {
    console.error('Error loading styling from Firebase:', error)
    return DEFAULT_STYLING
  }
}

async function saveStylingToFirebase(styling: any) {
  try {
    const stylingData = { ...styling, updatedAt: serverTimestamp() }
    await setDocumentInFirebase('global-styling', 'styling', stylingData)
    console.log('Styling saved to Firebase successfully')
    return { success: true, persisted: true, method: 'firebase' }
  } catch (error) {
    console.error('Error saving styling to Firebase:', error)
    return { success: false, persisted: false, method: 'failed', error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET() {
  try {
    const styling = await getStylingFromFirebase()
    return NextResponse.json(styling)
  } catch (error) {
    console.error('GET handler error:', error)
    return NextResponse.json(DEFAULT_STYLING)
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST request received')
    const stylingData = await request.json()
    console.log('Styling data received:', JSON.stringify(stylingData, null, 2))
    
    const result = await saveStylingToFirebase(stylingData)
    console.log('Save result:', result)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Styling saved successfully',
        persisted: result.persisted,
        method: result.method
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to save styling',
        persisted: result.persisted,
        method: result.method
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save styling',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
