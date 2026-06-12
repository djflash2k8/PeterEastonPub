import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('Testing Firebase connection...')
    
    // Test reading from Firebase
    const result = await getDocumentFromFirebase('test', 'connection')
    
    if (result) {
      console.log('Firebase read test successful:', result)
      return NextResponse.json({ 
        status: 'success', 
        message: 'Firebase connection working',
        data: result 
      })
    } else {
      console.error('Firebase read test failed: No data returned')
      return NextResponse.json({ 
        status: 'error', 
        message: 'No data returned from Firebase' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Firebase test failed:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Firebase test failed',
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('Testing Firebase write...')
    
    // Test writing to Firebase
    const testData = {
      timestamp: new Date().toISOString(),
      test: 'Firebase connection test',
      project: 'peter-easton-pub'
    }
    
    const result = await setDocumentInFirebase('test', 'connection', testData)
    
    if (result) {
      console.log('Firebase write test successful')
      return NextResponse.json({ 
        status: 'success', 
        message: 'Firebase write test successful' 
      })
    } else {
      console.error('Firebase write test failed: Write returned false')
      return NextResponse.json({ 
        status: 'error', 
        message: 'Firebase write test failed' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Firebase write test failed:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Firebase write test failed',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
