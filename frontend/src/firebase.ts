// @ts-ignore
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const key = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = Boolean(key && key !== 'your_firebase_api_key' && !key.includes('your_'));

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: key,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'project-1093978510125.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'project-1093978510125',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'project-1093978510125.appspot.com',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1093978510125',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization failed:', err);
  }
}

export { app, auth, googleProvider, signInWithPopup, GoogleAuthProvider };
export const isFirebaseConfigured = () => Boolean(isConfigured && auth);
export default app;
