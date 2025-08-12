import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  setDoc, 
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
  uid: string;
  username: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  photoURL?: string;
  status?: string;
  lastSeen?: string;
}

export interface SearchResult {
  id: string;
  username: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  status?: string;
}

/**
 * Get user data by UID
 */
export const getUserById = async (uid: string): Promise<UserData | null> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Search users by username (case-insensitive)
 */
export const searchUsersByUsername = async (
  searchTerm: string, 
  limitCount: number = 10
): Promise<SearchResult[]> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const searchLower = searchTerm.toLowerCase();
    
    // Create a query that searches for usernames starting with the search term
    const q = query(
      usersRef,
      where('username', '>=', searchLower),
      where('username', '<=', searchLower + '\uf8ff'),
      orderBy('username'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const users: SearchResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        username: data.username,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        photoURL: data.photoURL,
        status: data.status
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Search users by phone number
 */
export const searchUsersByPhone = async (
  phoneNumber: string
): Promise<SearchResult | null> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('phoneNumber', '==', phoneNumber),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        photoURL: data.photoURL,
        status: data.status
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching user by phone:', error);
    throw error;
  }
};

/**
 * Create or update user data
 */
export const createOrUpdateUser = async (
  uid: string, 
  userData: Partial<UserData>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', uid);
    const now = new Date().toISOString();
    
    await setDoc(userRef, {
      ...userData,
      updatedAt: now,
      createdAt: userData.createdAt || now
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<UserData>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete user data
 */
export const deleteUser = async (uid: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get all users (with pagination)
 */
export const getAllUsers = async (
  limitCount: number = 20,
  lastDoc?: any
): Promise<{ users: SearchResult[], lastDoc: any }> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const usersRef = collection(db, 'users');
    let q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, where('createdAt', '<', lastDoc.createdAt));
    }

    const querySnapshot = await getDocs(q);
    const users: SearchResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        username: data.username,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
        photoURL: data.photoURL,
        status: data.status
      });
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      users,
      lastDoc: lastVisible ? lastVisible.data() : null
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Check if username is available
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

/**
 * Check if phone number is already registered
 */
export const isPhoneNumberRegistered = async (phoneNumber: string): Promise<boolean> => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('phoneNumber', '==', phoneNumber),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking phone number registration:', error);
    throw error;
  }
};


