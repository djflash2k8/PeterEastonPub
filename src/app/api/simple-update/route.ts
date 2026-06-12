import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Simple update approach...')
    
    // Initialize Firebase Admin SDK directly
    const admin = require('firebase-admin')
    
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'peter-easton'
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@peter-easton.iam.gserviceaccount.com'
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
      
      if (privateKey) {
        admin.initializeApp({
          projectId,
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        })
      }
    }
    
    const db = admin.firestore()
    
    // Try to update the document directly
    const docRef = db.collection('test').doc('testing only')
    
    // First, get the current document
    const docSnapshot = await docRef.get()
    
    if (docSnapshot.exists) {
      const currentData = docSnapshot.data()
      console.log('Current data:', currentData)
      
      // Update the string field to 'True'
      const updatedData = { ...currentData }
      
      // Find and update the first string field
      for (const [key, value] of Object.entries(updatedData)) {
        if (typeof value === 'string') {
          updatedData[key] = 'True'
          console.log(`Updated field ${key} from "${value}" to "True"`)
          break
        }
      }
      
      updatedData.updatedAt = new Date().toISOString()
      
      // Save the updated document
      await docRef.set(updatedData)
      
      return NextResponse.json({ 
        status: 'success', 
        message: 'Successfully updated "testing only" document',
        originalData: currentData,
        updatedData: updatedData
      })
    } else {
      return NextResponse.json({ 
        status: 'not_found', 
        message: 'Document "testing only" does not exist' 
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to update document',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
