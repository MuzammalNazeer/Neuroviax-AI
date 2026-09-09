import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDu6hNhV1dJ1hhGhHMCpREH8BYR_VzdJ6w',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'neuroviax-a158e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'neuroviax-a158e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'neuroviax-a158e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1013246831383',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1013246831383:web:0f2a320eb6ba4092626552',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7P0VZGKJ7X',
};

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('[Firebase] Initialization notice:', err);
}

// ── Firebase Auth Helper Functions ─────────────────────────

export const firebaseEmailSignUp = async (email: string, pass: string, displayName?: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

export const firebaseEmailSignIn = async (email: string, pass: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

export const firebasePasswordReset = async (email: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  await sendPasswordResetEmail(auth, email);
};

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
};

export const isFirebaseConfigured = () => Boolean(auth);
export default app;
