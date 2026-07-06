/**
 * Firebase Admin SDK — server-side only (Next.js API routes)
 *
 * Root causes fixed:
 *  1. The old code called `admin.firestore('peweb')` which is not a valid
 *     overload — it must be `admin.firestore()` (no argument).
 *  2. The old code imported the *client* SDK (firebase/app, firebase/firestore)
 *     at the top of this file and then also required firebase-admin inside a
 *     try/catch.  Mixing client + admin SDK in the same module caused the
 *     "firestore is not a function" error at build time.
 *  3. The old code used `initializeApp()` unconditionally, which throws
 *     "Firebase App named '[DEFAULT]' already exists" on hot-reloads /
 *     serverless cold starts.  The fix uses `admin.apps.length` guard.
 */

import * as admin from 'firebase-admin'

// ─── Singleton initialisation ────────────────────────────────────────────────

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app()
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. ' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    )
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // Vercel stores the key with literal \n — replace them with real newlines
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
    projectId,
  })
}

function getDb(): admin.firestore.Firestore {
  getAdminApp()           // ensure app is initialised
  return admin.firestore()
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export async function getDocumentFromFirebase(
  collectionName: string,
  documentId: string
): Promise<any | null> {
  try {
    const db = getDb()
    const snap = await db.collection(collectionName).doc(documentId).get()
    if (snap.exists) {
      return snap.data() ?? null
    }
    return null
  } catch (error) {
    console.error(`[Firebase] getDocument(${collectionName}/${documentId}) failed:`, error)
    return null
  }
}

export async function setDocumentInFirebase(
  collectionName: string,
  documentId: string,
  data: any
): Promise<boolean> {
  try {
    const db = getDb()
    await db.collection(collectionName).doc(documentId).set(data, { merge: true })
    console.log(`[Firebase] setDocument(${collectionName}/${documentId}) OK`)
    return true
  } catch (error) {
    console.error(`[Firebase] setDocument(${collectionName}/${documentId}) failed:`, error)
    return false
  }
}

export async function queryCollectionFromFirebase(
  collectionName: string
): Promise<any[]> {
  try {
    const db = getDb()
    const snap = await db.collection(collectionName).get()
    const docs: any[] = []
    snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }))
    console.log(`[Firebase] queryCollection(${collectionName}) → ${docs.length} docs`)
    return docs
  } catch (error) {
    console.error(`[Firebase] queryCollection(${collectionName}) failed:`, error)
    return []
  }
}

export async function deleteDocumentFromFirebase(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  try {
    const db = getDb()
    await db.collection(collectionName).doc(documentId).delete()
    console.log(`[Firebase] deleteDocument(${collectionName}/${documentId}) OK`)
    return true
  } catch (error) {
    console.error(`[Firebase] deleteDocument(${collectionName}/${documentId}) failed:`, error)
    return false
  }
}

/** Returns an ISO timestamp string — compatible with Firestore and JSON */
export function serverTimestamp(): string {
  return new Date().toISOString()
}
