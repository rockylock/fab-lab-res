# Firebase Setup Instructions for CoA Fab Lab

## Prerequisites
- Firebase project created at https://console.firebase.google.com
- Blaze (pay-as-you-go) plan activated
- Budget alerts configured

## Step 1: Get Firebase Configuration

1. Go to your Firebase Console
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click the web icon (</>) to add a web app
7. Register your app with a nickname (e.g., "CoA Fab Lab Web")
8. Copy the configuration object

## Step 2: Update Firebase Configuration

Replace the placeholder values in `js/config/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 3: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional but recommended)
6. Add authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Step 4: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Go to "Rules" tab and paste the contents of `firestore.rules`

## Step 5: Deploy Cloud Functions

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize functions: `firebase init functions`
4. Deploy functions: `firebase deploy --only functions`

## Step 6: Configure Budget Alerts

1. In Firebase Console, go to "Usage and billing"
2. Click "Details & settings"
3. Set up budget alerts:
   - Monthly budget: $20
   - Alert at: $5
   - Alert at: $15

## Step 7: Test Configuration

1. Open your application in a browser
2. Open browser console (F12)
3. Look for "Firebase initialized successfully" message
4. Test authentication by trying to sign in

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Authentication enabled with proper providers
- [ ] Cloud Functions deployed with proper validation
- [ ] Budget alerts configured
- [ ] Authorized domains set up
- [ ] Admin emails configured in security rules

## Troubleshooting

### "Firebase not initialized" error
- Check that all Firebase SDK scripts are loading
- Verify configuration values are correct
- Check browser console for network errors

### Authentication not working
- Verify authorized domains include your domain
- Check that email/password authentication is enabled
- Ensure Google sign-in is configured (if using)

### Firestore access denied
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check that rules allow the operation you're trying to perform
- Verify user is authenticated before accessing data

## Next Steps

After completing this setup:
1. Test the authentication flow
2. Verify data can be saved to Firestore
3. Test Cloud Functions
4. Proceed to Day 2: Authentication Integration 