# Firebase Setup Instructions

## 🔥 Quick Fix for API Key Error

The error you're seeing is because the app is using demo Firebase credentials. Follow these steps to fix it:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or select an existing project
3. Enter project name: `whatsapp-web-ui` (or any name you prefer)
4. Follow the setup wizard (you can disable Google Analytics for now)

### Step 2: Add Web App
1. In your Firebase project dashboard, click the **web icon** (</>)
2. Register app with nickname: `whatsapp-web-ui`
3. **Copy the Firebase config object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Update Environment Variables
1. Open the `.env` file in the `whatsapp-web-ui` folder
2. Replace the placeholder values with your real Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **"Email/Password"** authentication
3. Enable **"Phone"** authentication (optional, requires Blaze plan for production)

### Step 5: Restart the App
```bash
# Stop the current app (Ctrl+C)
# Then restart
npm start
```

## ✅ What This Will Fix
- ❌ `auth/api-key-not-valid` error
- ❌ Firebase initialization failures
- ✅ User registration and login will work
- ✅ Real-time authentication state management

## 🔧 Alternative: Quick Test Setup
If you want to test the UI without Firebase for now, you can temporarily disable authentication by commenting out the Firebase initialization in `src/config/firebase.ts`.

## 📞 Need Help?
- Check the browser console for detailed error messages
- Make sure your `.env` file is in the correct location (`whatsapp-web-ui/.env`)
- Verify that all Firebase config values are copied correctly
- Ensure there are no extra spaces or quotes in the `.env` file
