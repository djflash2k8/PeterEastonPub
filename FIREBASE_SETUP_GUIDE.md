# Firebase Setup Guide for Peter Easton Website

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `peter-easton`
4. Click "Continue"
5. Disable Google Analytics (optional)
6. Click "Create project"

### 1.2 Enable Firestore Database
1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location (choose closest to your users)
5. Click "Create database"

## Step 2: Service Account Setup

### 2.1 Generate Service Account Key
1. In Firebase Console, go to "Project Settings" (gear icon)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Select "JSON" format
5. Click "Generate"
6. Save the JSON file securely (you already have this: `peter-easton-firebase-adminsdk-fbsvc-6fe2dc9f42.json`)

### 2.2 Extract Required Values from Service Account JSON
From your service account JSON file, you need:
- `project_id`: "peter-easton"
- `client_email`: "firebase-adminsdk-fbsvc@peter-easton.iam.gserviceaccount.com"
- `private_key`: The long private key string

## Step 3: Firebase Security Rules

### 3.1 Update Firestore Security Rules
Go to Firestore Database → Rules tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all collections
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3.2 Deploy Rules
1. Click "Publish" to deploy the rules
2. Wait for deployment to complete

## Step 4: Environment Variables Setup

### 4.1 Local Development (.env.local)
Create or update `.env.local` in your project root:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=peter-easton-pub
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@peter-easton-pub.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDES1f0VOfwXFOh\nGTCxLPJpXmqcXKrFVcLQtH5UJmi9aJwj0kvGrlUK27jtKpRj612BVuJctJOH7ynp\nTkFolRpsySTcgnKiGQ9BpQr1WefRNyVN7Wl2oxaqJlpO8gmVEXE04+zb2bTMaJnu\n4jQjKwtnHiy3TzT2cdUB9aw7BbW/snw7eYs0tzHhDLof30SgASgGpG1ePEeU9jP5\nato1REnobvskevBj1+1GB6FMmYb7X3/jE4uhYP5xJmVukZ37aMJv2DePQ0/nT67Y\nBya1TEdwE8bR1LrN9WqVdeG5+VajURzVnKtOupEMLjZ79kImYywKFxprySyYAT0q\nYO98mvqtAgMBAAECggEABI3c8gnAQdbah9vOQeYRj7lFjvAldCObu/zcC3bCqlZR\nfRFFecwUpAZaAYKh47mTt0r9QHpeC+LUHZoXsWX4MXrvNICASVt8e6DpIq0d0EBP\nyMGP11VMUtFF+hvqdf9sGXaKScWAyNdKbvznicNXZeKQ1gXr7CXS89Mv1kS5JUPj\n78Hx2o8A/WuCH/w5M8bajargPRgfO1EHJmbJANkdoVFjcF9JGkkkpv8RSfXgaCEC\nOpMmTCoYgaJap0JFnCOrt9No5H6CrgZIQqBXxqqdgJkrUkR/YT4w+s97I65iVBO1\nmOBml6yaGa4HHT14AvUynF0m/XyPnSPGY1hy2+za/wKBgQDj19ej4ytJHm6qamAN\n5rVKAEgfa0p9T/pCFhFMarcYDd4yNbjUCxE7e4g8PUkxYI2Pwd2KNL/nKZL1wzh/\nZECcHBuF8zmJa32XoPyGUtXaaxB3IYf2Pzg/6CL2AGmo5SJb7jTrHPpcmSrSO0YX\newUKrN/rHfJPX2KW/teap9NDiwKBgQDcjWg4N7ny9YxgGsteHxBg7PMB79pqpetI\nRYSWWv0+6cyuCNEvBfun6woUffyCudBHPrIHQ6ZzKyVG0lZdEa4GQQboAf/7F5C3\ng7b3F2PLBA7bnHaU9CrRx5h22g1HIW2GTFdBkht/PYkbz3LBSOw4KtR2f9XWSM0y\nkRaj0N8hpwKBgQCa/s90buqYYDp6dckIS+USBWUK8qsG2mxtnqN/76zEkVKRp5gn\nr6u2YlAIYsyy6XMD06dJCJ9vuwl9ZKO/jcyiJkDW++ItSNF0YBDJs/pFDsZxtH7Q\nlqtGVj3KSfeW7OFV1pNrShhK++t0ftwsxwRkAbyGLqYTNtlTzOORExAWBwKBgBO9\nrHhrtH8kr13iyBUynpquWsnvmBM3qqmbX1S97DD3aFSjgWW+GVpcVVikNjfVPelC\nmVjBG2Lvl7SRGx3VeUgiBeY6V5k38MIcTgIr28jOIi5SAOMwP6zrOqBYwBt/yHfe\n2WiLFV78OQt+M/1M86fLXZ0FsDQv6/38spQTHAW9AoGAe8XfSobITr/GNOTe5pKs\n6oKAwBKah6moxLIMUuATUXscmKB0ayBmWwYnIqq/baMiXds6YGLyRhsT52ENfRo6\nddflzJtvpa8gLDP82UvLQIpJyKppyjKLyMiUmqf/nlK+dj3YCYVQi88WYLpisKvq\n5EJzt0LokoCWypS+a5JuO1M=\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBkP7sCqLj5n9T2g3h4j5k6l7m8n9o0p1q

# Cloudinary
CLOUDINARY_CLOUD_NAME=dci3a6zp4
CLOUDINARY_API_KEY=671863912971299
CLOUDINARY_API_SECRET=X4uZ6cm5F2I-GtRxomRatmP8_Uo
```

### 4.2 Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: "peter-easton"
3. Go to "Settings" → "Environment Variables"
4. Add each variable from above:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

**Important:** For `FIREBASE_PRIVATE_KEY`, include the entire key including `\n` characters.

## Step 5: Firebase SDK Installation

### 5.1 Install Required Packages
```bash
npm install firebase-admin firebase
```

### 5.2 Verify Firebase Configuration
Check that your `src/lib/firebase.ts` has the correct initialization:

```typescript
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
let app: any = null
let db: any = null
let firebaseAvailable = false

try {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'peter-easton'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@peter-easton.iam.gserviceaccount.com'
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!privateKey) {
    console.warn('Missing Firebase private key, using memory fallback')
    firebaseAvailable = false
  } else {
    console.log('Initializing Firebase Admin SDK...')
    const admin = require('firebase-admin')
    app = admin.initializeApp({
      projectId,
      credential: admin.credential.cert({
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
    db = admin.firestore()
    firebaseAvailable = true
    console.log('Firebase Admin SDK initialized successfully')
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error)
  firebaseAvailable = false
}
```

## Step 6: Testing Firebase Connection

### 6.1 Create Test API Endpoint
Create `src/app/api/test-firebase/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getDocumentFromFirebase, setDocumentInFirebase } from '@/lib/firebase'

export async function GET() {
  try {
    // Test reading from Firebase
    const result = await getDocumentFromFirebase('test', 'connection')
    
    if (result.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Firebase connection working',
        data: result.data 
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Firebase test failed',
      error: (error as Error).message 
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Test writing to Firebase
    const testData = {
      timestamp: new Date().toISOString(),
      test: 'Firebase connection test'
    }
    
    const result = await setDocumentInFirebase('test', 'connection', testData)
    
    if (result.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Firebase write test successful' 
      })
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Firebase write test failed',
      error: (error as Error).message 
    }, { status: 500 })
  }
}
```

### 6.2 Test Firebase Connection
1. Deploy to Vercel: `vercel --prod`
2. Test GET: `https://peter-easton.vercel.app/api/test-firebase`
3. Test POST: `curl -X POST https://peter-easton.vercel.app/api/test-firebase`

## Step 7: Troubleshooting Common Issues

### 7.1 Permission Denied Errors
- Check Firestore security rules are deployed
- Verify service account has Firestore permissions
- Ensure environment variables are correctly set

### 7.2 Initialization Errors
- Verify `FIREBASE_PRIVATE_KEY` includes proper `\n` characters
- Check `FIREBASE_CLIENT_EMAIL` matches service account
- Ensure `FIREBASE_PROJECT_ID` is correct

### 7.3 Vercel Specific Issues
- Environment variables may need redeployment to take effect
- Check Vercel logs for detailed error messages
- Ensure all required environment variables are set

## Step 8: Verification Checklist

Before proceeding with Cloudinary integration, verify:

- [ ] Firebase project created and configured
- [ ] Firestore database created
- [ ] Service account key generated and saved
- [ ] Firestore security rules deployed
- [ ] All environment variables set locally and in Vercel
- [ ] Firebase test API endpoints working
- [ ] No permission errors in logs
- [ ] Events API can create/read/write events successfully

Once all these steps are completed and verified, your Firebase setup will be properly configured for the Peter Easton website.
