import { NextResponse } from 'next/server'
import { setDocumentInFirebase, getDocumentFromFirebase } from '@/lib/firebase'

export async function POST() {
  try {
    console.log('Creating replacement document for "testing only"...')
    
    // First, try to read the original "testing only" document to get its data
    let originalData = null
    try {
      originalData = await getDocumentFromFirebase('test', 'testing only')
      console.log('Original data found:', originalData)
    } catch (error) {
      console.log('Could not read original document, creating new data')
    }
    
    // Create replacement document with the same structure but with 'True'
    const replacementData: any = {
      message: 'True', // This is the string field set to 'True'
      timestamp: new Date().toISOString(),
      test: 'Workspace test - created to verify same workspace',
      originalDocumentId: 'testing only',
      replacementDocumentId: 'testing_only',
      workspaceTest: true
    }
    
    // If we found original data, try to preserve its structure
    if (originalData) {
      // Copy all original fields but update string fields to 'True'
      for (const [key, value] of Object.entries(originalData)) {
        if (typeof value === 'string') {
          replacementData[key] = 'True'
        } else {
          replacementData[key] = value
        }
      }
      replacementData.originalData = originalData
    }
    
    // Create the new document with underscore ID
    const result = await setDocumentInFirebase('test', 'testing_only', replacementData)
    
    if (result) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Replacement document created successfully',
        documentId: 'testing_only',
        originalData: originalData,
        replacementData: replacementData,
        workspaceVerified: true
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to create replacement document' 
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create replacement document',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
