import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('Testing database access...')
    
    // First, try to read the connection document we know exists
    const connectionDoc = await getDocumentFromFirebase('test', 'connection')
    console.log('Connection document:', connectionDoc)
    
    // Then try to read the "testing only" document
    const testingDoc = await getDocumentFromFirebase('test', 'testing only')
    console.log('Testing only document:', testingDoc)
    
    if (testingDoc) {
      // Update the string field to 'True'
      const updatedData = { ...testingDoc }
      
      // Find the string field and update it
      for (const [key, value] of Object.entries(updatedData)) {
        if (typeof value === 'string') {
          updatedData[key] = 'True'
          console.log(`Updated field ${key} from "${value}" to "True"`)
          break
        }
      }
      
      updatedData.updatedAt = new Date().toISOString()
      
      const result = await setDocumentInFirebase('test', 'testing only', updatedData)
      
      return NextResponse.json({ 
        status: 'success', 
        message: 'Found and updated "testing only" document',
        connectionDoc: connectionDoc,
        originalData: testingDoc,
        updatedData: updatedData,
        updateResult: result
      })
    } else {
      return NextResponse.json({ 
        status: 'not_found', 
        message: 'Document "testing only" not found',
        connectionDoc: connectionDoc,
        testingDoc: testingDoc
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database access failed',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
