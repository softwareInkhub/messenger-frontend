import { initializeApp } from 'firebase/app';
import { getAuth, PhoneAuthProvider, RecaptchaVerifier, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Hardcoded for immediate fix
const firebaseConfig = {
  apiKey: "AIzaSyAtqltJM5i3tVE312iZCqTJO5OQ_qVOf2E",
  authDomain: "messagingapp-844da.firebaseapp.com",
  projectId: "messagingapp-844da",
  storageBucket: "messagingapp-844da.firebasestorage.app",
  messagingSenderId: "950457344052",
  appId: "1:950457344052:web:0628c5d6fe8618ccfcaa61",
  measurementId: "G-JDK5SJQ55R"
};

// Debug: Log the API key being used
console.log('🔍 Debug - API Key being used:', process.env.REACT_APP_FIREBASE_API_KEY ? 'REAL KEY' : 'DEMO KEY');
console.log('🔍 Debug - Environment loaded:', process.env.REACT_APP_FIREBASE_API_KEY ? 'YES' : 'NO');

// Test mode flag - set to true to bypass Firebase for UI testing
const TEST_MODE = process.env.REACT_APP_TEST_MODE === 'true';

// Validate Firebase config
const validateFirebaseConfig = () => {
  // Allow test mode to bypass Firebase
  if (TEST_MODE) {
    console.warn('🧪 Test mode enabled - Firebase authentication disabled');
    return false;
  }
  
  // Check if we're using demo values
  const isUsingDemoValues = firebaseConfig.apiKey === 'demo-api-key' || 
                           firebaseConfig.authDomain === 'demo-project.firebaseapp.com' ||
                           !firebaseConfig.apiKey || firebaseConfig.apiKey.length < 10;
  
  if (isUsingDemoValues) {
    console.error('❌ Firebase API Key Error: Using demo/placeholder values');
    console.error('📝 To fix this error:');
    console.error('1. Go to https://console.firebase.google.com/');
    console.error('2. Create a new project or select existing one');
    console.error('3. Add a web app to your project');
    console.error('4. Copy the Firebase config object');
    console.error('5. Update the .env file with your real credentials');
    console.error('📖 See FIREBASE_SETUP_INSTRUCTIONS.md for detailed steps');
    console.error('💡 Or set REACT_APP_TEST_MODE=true in .env to bypass Firebase');
    return false;
  }
  
  // Check if we have valid Firebase config
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10) {
    console.log('✅ Firebase config looks valid');
    return true;
  }
  
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing Firebase configuration:', missingFields);
    console.error('📝 Please update your .env file with Firebase config');
    console.error('📖 See FIREBASE_SETUP_INSTRUCTIONS.md for instructions');
    return false;
  }
  
  return true;
};

// Initialize Firebase only if config is valid
let app;
let auth;
let db;
let storage;
let messaging;

try {
  // Force initialize Firebase with provided config
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  messaging = getMessaging(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}

// Test Firestore access
export const testFirestoreAccess = async () => {
  if (!db) {
    console.error('❌ Firestore not initialized');
    return false;
  }
  
  try {
    console.log('🧪 Testing Firestore access...');
    const testDoc = doc(db, 'test', 'test-access');
    await setDoc(testDoc, {
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firestore write test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Firestore write test failed:', error);
    return false;
  }
};

// Phone number to email conversion utilities
export const phoneToEmail = (phoneNumber: string): string => {
  // Ensure consistent phone number formatting
  let cleanPhone = phoneNumber.trim();
  
  // Remove any spaces or special characters except + and digits
  cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = `+${cleanPhone}`;
  }
  
  // Remove the + for the email conversion to ensure consistency
  const phoneWithoutPlus = cleanPhone.substring(1);
  
  return `${phoneWithoutPlus}@app.local`;
};

export const emailToPhone = (email: string): string => {
  // Extract phone number from email format and add + back
  const phoneWithoutPlus = email.replace('@app.local', '');
  return `+${phoneWithoutPlus}`;
};

// Authentication functions
export const signUpWithPhone = async (phoneNumber: string, password: string, username: string) => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }

  const email = phoneToEmail(phoneNumber);
  console.log('🔍 Signup attempt:', { phoneNumber, email, username });
  
  try {
    // Test Firestore access first
    if (db) {
      await testFirestoreAccess();
    }
    
    // Create user with email/password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ User created successfully:', { uid: user.uid, email });
    
    // Store additional user data in Firestore
    if (db) {
      try {
        console.log('📝 Storing user data in Firestore for UID:', user.uid);
        await setDoc(doc(db, 'users', user.uid), {
          username,
          phoneNumber,
          email: email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('✅ User data stored successfully in Firestore');
      } catch (firestoreError: any) {
        console.error('❌ Firestore write error:', firestoreError);
        // Don't throw here - user is already created in Auth
        console.warn('⚠️ User created in Auth but failed to store in Firestore');
      }
    } else {
      console.warn('⚠️ Firestore not initialized - user data not stored');
    }
    
    return user;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signInWithPhone = async (phoneNumber: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }

  const email = phoneToEmail(phoneNumber);
  console.log('🔍 Login attempt:', { phoneNumber, email });
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login successful for:', email);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('🔍 Attempted login with:', { phoneNumber, email });
    throw error;
  }
};

export const signOutUser = async () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Signout error:', error);
    throw error;
  }
};

// User data functions
export const getUserData = async (uid: string) => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error: any) {
    console.error('Get user data error:', error);
    throw error;
  }
};

export const searchUsersByUsername = async (searchTerm: string, limitCount: number = 10) => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchTerm.toLowerCase()),
      where('username', '<=', searchTerm.toLowerCase() + '\uf8ff'),
      orderBy('username'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error: any) {
    console.error('Search users error:', error);
    throw error;
  }
};

// Phone Auth Provider (for OTP if needed)
export const phoneAuthProvider = auth ? new PhoneAuthProvider(auth) : null;

// ReCAPTCHA Verifier
export const createRecaptchaVerifier = (containerId: string) => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Please check your configuration.');
  }
  
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
};

// Messaging functions
export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      console.log('Notification token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Firebase Auth not initialized');
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
};

// Export Firebase instances
export { auth, db, storage, messaging };
export default app;
