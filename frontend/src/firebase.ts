// @ts-ignore
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration for Neuroviax AI
// Project: project-1093978510125
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'project-1093978510125.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'project-1093978510125',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'project-1093978510125.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1093978510125',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialize or reuse Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);

// Re-export auth utilities for consumers
export { signInWithPopup, GoogleAuthProvider };

// Google Auth Provider configured to prompt for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && key !== 'your_firebase_api_key' && !key.includes('your_'));
};

export default app;
