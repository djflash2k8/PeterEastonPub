import { NextResponse } from 'next/server'
import { setDocumentInFirebase } from '@/lib/firebase'

export async function POST() {
  try {
    console.log('Creating test document...')
    
    // Create a simple test document
    const testData = {
      message: 'True',
      timestamp: new Date().toISOString(),
      test: 'Database connection test'
    }
    
    const result = await setDocumentInFirebase('test', 'simple_test', testData)
    
    if (result) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Test document created successfully',
        data: testData
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to create test document' 
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create document',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
