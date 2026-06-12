import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debugging database ID...')
    
    // Initialize Firebase Admin SDK directly
    const admin = require('firebase-admin')
    
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
    
    // Run the specific debug line
    const databaseId = db._databaseId || db.databaseId
    const result = {
      databaseId: databaseId,
      _databaseId: db._databaseId,
      databaseId_property: db.databaseId,
      projectId: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    }
    
    console.log('Database debug result:', result)
    
    return NextResponse.json({ 
      status: 'debug_result', 
      message: 'Database ID debug',
      result: result
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to debug database',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
