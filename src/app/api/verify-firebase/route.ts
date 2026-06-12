import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase, queryCollectionFromFirebase } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('=== COMPREHENSIVE FIREBASE VERIFICATION ===')
    
    // Check environment variables
    const envCheck = {
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }
    
    console.log('Environment check:', envCheck)
    
    // Test 1: Write a test document with unique timestamp
    const testTimestamp = new Date().toISOString()
    const testData = {
      testType: 'FIREBASE_VERIFICATION_TEST',
      timestamp: testTimestamp,
      message: 'This should appear in Firebase Firestore database',
      verificationId: Date.now().toString(),
      environment: process.env.NODE_ENV || 'unknown'
    }
    
    console.log('Writing test document to Firebase...')
    const writeResult = await setDocumentInFirebase('verification', 'test_' + Date.now(), testData)
    
    // Test 2: Read back the document
    console.log('Reading test document from Firebase...')
    const readResult = await getDocumentFromFirebase('verification', 'test_' + Date.now())
    
    // Test 3: Query all documents in verification collection
    console.log('Querying verification collection...')
    const queryResult = await queryCollectionFromFirebase('verification')
    
    return NextResponse.json({
      status: 'success',
      message: 'Firebase verification completed',
      diagnostics: {
        environment: envCheck,
        writeTest: {
          success: writeResult,
          testData: testData
        },
        readTest: {
          success: !!readResult,
          data: readResult
        },
        queryTest: {
          success: Array.isArray(queryResult),
          documentCount: queryResult?.length || 0,
          documents: queryResult?.slice(-5) // Last 5 documents
        },
        note: 'Check your Firebase Console > Firestore Database to see if documents appear'
      }
    })
    
  } catch (error) {
    console.error('Firebase verification failed:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Firebase verification failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('=== MANUAL FIREBASE WRITE TEST ===')
    
    // Create a very obvious test document
    const testData = {
      manualTest: true,
      timestamp: new Date().toISOString(),
      message: 'MANUAL TEST - If you see this in Firebase, it is working!',
      testId: 'manual_' + Date.now(),
      pleaseCheck: 'Look in Firebase Console > Firestore Database > verification collection'
    }
    
    const result = await setDocumentInFirebase('verification', 'manual_' + Date.now(), testData)
    
    return NextResponse.json({
      status: 'success',
      message: 'Manual test document written',
      success: result,
      testData: testData,
      instructions: 'Go to Firebase Console > Firestore Database and look for collection "verification"'
    })
    
  } catch (error) {
    console.error('Manual write test failed:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Manual write test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
