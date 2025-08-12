import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, createRecaptchaVerifier } from '../config/firebase';

// User type for our app
export interface AppUser {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  isPhoneVerified: boolean;
}

// Auth context type
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: any) => Promise<ConfirmationResult>;
  confirmOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  isPhoneVerified: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          isPhoneVerified: !!firebaseUser.phoneNumber,
        };
        setUser(appUser);
        setIsPhoneVerified(!!firebaseUser.phoneNumber);
      } else {
        setUser(null);
        setIsPhoneVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: any) => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error signing in with phone:', error);
      throw error;
    }
  };

  // Confirm OTP
  const confirmOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      await confirmationResult.confirm(otp);
      console.log('Phone number verified successfully');
    } catch (error) {
      console.error('Error confirming OTP:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsPhoneVerified(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithPhone,
    confirmOTP,
    signOut,
    isPhoneVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
