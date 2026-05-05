import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCUor4K2aux-AImj1jiRlI9ejs2SZ5iKxI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "peter-easton.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "peter-easton",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "peter-easton.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "159093650681",
  appId: process.env.FIREBASE_APP_ID || "1:159093650681:web:64b5a22f5e6cf3ea621e28",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-2EKVQEB4JV"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

export { db, doc, getDoc, setDoc, collection }
