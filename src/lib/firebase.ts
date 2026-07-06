// Simple in-memory storage with environment variable fallback for serverless compatibility
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp as firebaseServerTimestamp } from 'firebase/firestore'

// Firebase Client configuration for serverless environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkP7sCqLj5n9T2g3h4j5k6l7m8n9o0p1q",
  authDomain: "peter-easton.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "peter-easton",
  storageBucket: "peter-easton.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
}

// Initialize Firebase Admin SDK
let app: any = null
let db: any = null
let firebaseAvailable = false

try {
  // Check if we have all required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || 'peter-easton'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@peter-easton.iam.gserviceaccount.com'
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!privateKey) {
    console.warn('Missing Firebase private key, using memory fallback')
    firebaseAvailable = false
  } else {
    console.log('Initializing Firebase Admin SDK...')
    const admin = require('firebase-admin')
    const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore')
    app = admin.initializeApp({
      projectId,
      credential: admin.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
    db = getAdminFirestore(app)
    firebaseAvailable = true
    console.log('Firebase Admin SDK initialized successfully')
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error)
  firebaseAvailable = false
}

// In-memory storage fallback with environment variable persistence
const memoryStorage: { [key: string]: any } = {}

// Initialize memory storage from environment variables (serverless persistence)
const initializeMemoryFromEnv = () => {
  try {
    const envData = process.env.MEMORY_STORAGE || '{}'
    const parsedData = JSON.parse(envData)
    Object.assign(memoryStorage, parsedData)
    console.log('Initialized memory storage from environment:', Object.keys(parsedData).length, 'items')
    console.log('Current memory storage keys:', Object.keys(memoryStorage))
  } catch (error) {
    console.error('Failed to initialize memory from environment:', error)
  }
}

// Save memory storage to environment variables
const saveMemoryToEnv = () => {
  try {
    process.env.MEMORY_STORAGE = JSON.stringify(memoryStorage)
    console.log('Saved memory storage to environment:', Object.keys(memoryStorage).length, 'items')
  } catch (error) {
    console.error('Failed to save memory to environment:', error)
  }
}

// Helper functions for memory storage
const getMemoryKey = (collection: string, documentId: string) => `${collection}_${documentId}`

const getFromMemory = (collection: string, documentId: string) => {
  const key = getMemoryKey(collection, documentId)
  return memoryStorage[key] || null
}

const setToMemory = (collection: string, documentId: string, data: any) => {
  const key = getMemoryKey(collection, documentId)
  memoryStorage[key] = { ...data, updatedAt: new Date().toISOString() }
  return true
}

const queryFromMemory = (collection: string) => {
  const documents: any[] = []
  const collectionPrefix = `${collection}_`
  Object.keys(memoryStorage).forEach(key => {
    if (key.startsWith(collectionPrefix)) {
      const documentId = key.replace(collectionPrefix, '')
      documents.push({ id: documentId, ...memoryStorage[key] })
    }
  })
  return documents
}

const deleteFromMemory = (collection: string, documentId: string) => {
  const key = getMemoryKey(collection, documentId)
  delete memoryStorage[key]
  return true
}

// Hybrid Firestore functions with memory fallback
async function getDocumentFromFirebase(collectionName: string, documentId: string) {
  if (firebaseAvailable && db) {
    try {
      const docRef = doc(db, collectionName, documentId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        console.log('Loaded from Firebase:', collectionName, documentId)
        return docSnap.data()
      } else {
        console.log('Document not found in Firebase, checking memory:', collectionName, documentId)
        return getFromMemory(collectionName, documentId)
      }
    } catch (error) {
      console.error('Firebase read failed, using memory fallback:', error)
      return getFromMemory(collectionName, documentId)
    }
  } else {
    console.log('Firebase not available, using memory storage:', collectionName, documentId)
    return getFromMemory(collectionName, documentId)
  }
}

async function setDocumentInFirebase(collectionName: string, documentId: string, data: any) {
  if (firebaseAvailable && db) {
    try {
      const docRef = doc(db, collectionName, documentId)
      await setDoc(docRef, data)
      console.log('Saved to Firebase:', collectionName, documentId)
      // Also save to memory as backup and persist to environment
      setToMemory(collectionName, documentId, data)
      saveMemoryToEnv()
      return true
    } catch (error) {
      console.error('Firebase write failed, using memory fallback:', error)
      setToMemory(collectionName, documentId, data)
      saveMemoryToEnv()
      return true
    }
  } else {
    console.log('Firebase not available, using memory storage:', collectionName, documentId)
    setToMemory(collectionName, documentId, data)
    saveMemoryToEnv()
    return true
  }
}

async function queryCollectionFromFirebase(collectionName: string) {
  // Initialize memory from environment at start of operation
  initializeMemoryFromEnv()
  
  if (firebaseAvailable && db) {
    try {
      const collectionRef = collection(db, collectionName)
      const querySnapshot = await getDocs(collectionRef)
      
      const documents: any[] = []
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() })
      })
      
      console.log('Queried from Firebase:', collectionName, documents.length, 'documents')
      return documents
    } catch (error) {
      console.error('Firebase query failed, using memory fallback:', error)
      return queryFromMemory(collectionName)
    }
  } else {
    console.log('Firebase not available, using memory storage:', collectionName)
    return queryFromMemory(collectionName)
  }
}

async function deleteDocumentFromFirebase(collectionName: string, documentId: string) {
  if (firebaseAvailable && db) {
    try {
      const docRef = doc(db, collectionName, documentId)
      await deleteDoc(docRef)
      console.log('Deleted from Firebase:', collectionName, documentId)
      // Also delete from memory and persist to environment
      deleteFromMemory(collectionName, documentId)
      saveMemoryToEnv()
      return true
    } catch (error) {
      console.error('Firebase delete failed, using memory fallback:', error)
      return deleteFromMemory(collectionName, documentId)
    }
  } else {
    console.log('Firebase not available, using memory storage:', collectionName, documentId)
    return deleteFromMemory(collectionName, documentId)
  }
}

// Server timestamp for hybrid approach
const serverTimestamp = () => {
  if (firebaseAvailable) {
    try {
      return firebaseServerTimestamp()
    } catch (error) {
      console.error('Firebase server timestamp failed, using fallback:', error)
      return new Date().toISOString()
    }
  } else {
    return new Date().toISOString()
  }
}

export { getDocumentFromFirebase, setDocumentInFirebase, queryCollectionFromFirebase, deleteDocumentFromFirebase, serverTimestamp }
