import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

export async function GET() {
  try {
    // From the screenshot, I can see the document is in the 'test' collection
    // with document ID 'testing only' and has a string field that needs to be updated to 'True'
    
    const docData = await getDocumentFromFirebase('test', 'testing only')
    
    if (docData) {
      console.log('Found "testing only" document:', docData)
      
      // Update the string field to 'True'
      const updatedData = { ...docData }
      
      // Find the string field and update it to 'True'
      for (const [key, value] of Object.entries(updatedData)) {
        if (typeof value === 'string') {
          updatedData[key] = 'True'
          console.log(`Updated field ${key} from "${value}" to "True"`)
          break
        }
      }
      
      updatedData.updatedAt = new Date().toISOString()
      
      const result = await setDocumentInFirebase('test', 'testing only', updatedData)
      
      if (result) {
        return NextResponse.json({ 
          status: 'success', 
          message: 'Found and updated "testing only" document in test collection',
          originalData: docData,
          updatedData: updatedData
        })
      } else {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Failed to update document' 
        }, { status: 500 })
      }
    } else {
      return NextResponse.json({ 
        status: 'not_found', 
        message: 'Document "testing only" not found in test collection' 
      })
    }
  } catch (error) {
    console.error('Error accessing database:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to access database',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
