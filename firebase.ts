import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Accessing secrets via environment variables for security
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Attempts to log in using a "Secret ID".
 * Maps the ID to an email/password combination.
 * If the user doesn't exist, it automatically registers them.
 */
export const loginWithSecretId = async (secretId: string) => {
  // sanitize the ID to ensure valid email format
  const sanitizedId = secretId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (sanitizedId.length < 3) {
      throw new Error("Secret ID must be at least 3 alphanumeric characters.");
  }

  const email = `${sanitizedId}@expenwall.app`;
  const password = `pass_${sanitizedId}`;

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // If user not found or invalid credential (which might mean user not found in newer API), try to register
    if (
      error.code === 'auth/user-not-found' || 
      error.code === 'auth/invalid-credential' || 
      error.code === 'auth/wrong-password'
    ) {
      try {
        return await createUserWithEmailAndPassword(auth, email, password);
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
             // This happens if the password didn't match the deterministic password
             throw new Error("This Secret ID is already in use.");
        }
        throw createError;
      }
    }
    throw error;
  }
};

export { app, auth, db };