// ============================================
// FIREBASE AUTHENTICATION CONTEXT
// ============================================
// Manages user authentication state across the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { 
  subscribeToAuthState, 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  logOut,
  getAuthErrorMessage 
} from '../firebase/auth';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  // Auth methods
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email/password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await logOut();
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signUp,
      signIn,
      signInGoogle,
      signOut,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
