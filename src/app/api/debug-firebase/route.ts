import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, serverTimestamp } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('=== Firebase Debug Endpoint ===')
    console.log('Environment variables check:', {
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
    })
    
    // Test a simple Firestore operation
    try {
        const testDoc = await getDocumentFromFirebase('test', 'debug')
        console.log('Test doc exists:', !!testDoc)
        return NextResponse.json({
          success: true,
          message: 'Firebase Client SDK working',
          dbInitialized: !!testDoc,
          testDocExists: !!testDoc
        })
      } catch (firestoreError) {
        console.error('Firestore operation failed:', firestoreError)
        return NextResponse.json({
          success: false,
          message: 'Firestore operation failed',
          error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
        })
      }
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
