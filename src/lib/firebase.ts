/**
 * Firebase Firestore Utility Functions
 * Handles all database operations for the application
 */

import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp as firebaseServerTimestamp,
  Timestamp,
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

/**
 * Get server timestamp for use in Firestore documents
 */
export function serverTimestamp() {
  return firebaseServerTimestamp()
}

/**
 * Query a collection from Firestore
 * @param collectionName - Name of the collection to query
 * @param whereConditions - Optional array of where conditions [field, operator, value]
 * @returns Array of documents with their IDs
 */
export async function queryCollectionFromFirebase(
  collectionName: string,
  whereConditions?: [string, string, any][]
): Promise<any[]> {
  try {
    const collectionRef = collection(db, collectionName)
    let q = query(collectionRef)

    if (whereConditions && whereConditions.length > 0) {
      const conditions = whereConditions.map(([field, operator, value]) => {
        return where(field, operator as any, value)
      })
      q = query(collectionRef, ...conditions)
    }

    const querySnapshot = await getDocs(q)
    const documents: any[] = []

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return documents
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error)
    throw error
  }
}

/**
 * Get a single document from Firestore
 * @param collectionName - Name of the collection
 * @param documentId - ID of the document
 * @returns Document data or null if not found
 */
export async function getDocumentFromFirebase(
  collectionName: string,
  documentId: string
): Promise<any | null> {
  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    }

    return null
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error)
    throw error
  }
}

/**
 * Set a document in Firestore (creates or overwrites)
 * @param collectionName - Name of the collection
 * @param documentId - ID of the document
 * @param data - Data to set
 */
export async function setDocumentInFirebase(
  collectionName: string,
  documentId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId)
    await setDoc(docRef, data, { merge: true })
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error)
    throw error
  }
}

/**
 * Update a document in Firestore (partial update)
 * @param collectionName - Name of the collection
 * @param documentId - ID of the document
 * @param data - Data to update
 */
export async function updateDocumentInFirebase(
  collectionName: string,
  documentId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    throw error
  }
}

/**
 * Delete a document from Firestore
 * @param collectionName - Name of the collection
 * @param documentId - ID of the document
 */
export async function deleteDocumentFromFirebase(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    throw error
  }
}

export { Timestamp }
