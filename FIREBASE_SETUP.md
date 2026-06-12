# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" 
3. Enter project name: "peter-easton-pub"
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Firestore Database

1. In your Firebase project, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location (choose closest to your users)
5. Click "Create database"

## Step 3: Get Firebase Configuration

1. In Firebase project, click the gear icon > Project settings
2. Under "Your apps", click the web icon (</>)
3. Enter app name: "Peter Easton Pub Website"
4. Click "Register app"
5. Copy the firebaseConfig object

## Step 4: Update Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Firebase config:
   ```
   FIREBASE_API_KEY=your-actual-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   ```

## Step 5: Test the Integration

1. Restart your development server
2. Try saving home page content in admin panel
3. Check Firebase Console > Firestore to see the saved data

## Step 6: Deploy to Production

1. Add Firebase credentials to Vercel environment variables
2. Deploy your updated code
3. Test the save functionality in production

## Security Note

For production, you'll want to:
- Set up Firestore security rules
- Consider enabling authentication for database access
- Monitor database usage and costs
