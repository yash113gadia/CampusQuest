// ============================================
// FIREBASE AUTHENTICATION SERVICE
// ============================================
// Handles user authentication for Campus Quest

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// ============================================
// EMAIL/PASSWORD AUTH
// ============================================

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return user;
  } catch (error: unknown) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// ============================================
// GOOGLE AUTH
// ============================================

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Create/update user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return user;
  } catch (error: unknown) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// ============================================
// SIGN OUT
// ============================================

/**
 * Sign out current user
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// ============================================
// ERROR HANDLING HELPER
// ============================================

/**
 * Get user-friendly error message from Firebase error code
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};
