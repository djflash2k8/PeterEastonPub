import { NextResponse } from 'next/server'
import { setDocumentInFirebase } from '@/lib/firebase'

export async function POST() {
  try {
    console.log('Creating workspace verification document...')
    
    // Create a very specific test document that should be easily visible
    const testDocument = {
      workspaceTest: 'CASCADE_WORKSPACE_TEST',
      timestamp: new Date().toISOString(),
      message: 'This should appear in your Firebase Console',
      collection: 'test',
      documentId: 'cascade_workspace_test',
      verification: true
    }
    
    const result = await setDocumentInFirebase('test', 'cascade_workspace_test', testDocument)
    
    if (result) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Workspace test document created',
        documentData: testDocument,
        instructions: 'Look for document ID "cascade_workspace_test" in your Firebase Console'
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to create workspace test document' 
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create workspace test document',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
