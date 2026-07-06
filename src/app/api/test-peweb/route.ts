import { NextResponse } from 'next/server'
import { setDocumentInFirebase } from '@/lib/firebase'

export async function POST() {
  try {
    console.log('Testing peweb database connection...')
    
    // Create a simple test document in peweb database
    const testData = {
      message: 'PEWEB_DATABASE_TEST',
      database: 'peweb',
      timestamp: new Date().toISOString(),
      workspace: 'Now should be in same workspace'
    }
    
    const result = await setDocumentInFirebase('test', 'peweb_verification', testData)
    
    if (result) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'PEWEB database connection successful',
        data: testData
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to connect to PEWEB database' 
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to test PEWEB database',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
