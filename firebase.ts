import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

// Simple validation to warn developer if keys are missing
if (!firebaseConfig.apiKey) {
  console.error("Expenwall Error: Firebase API keys are missing. Please check your .env file or Vercel/Netlify environment variables.");
}

// Initialize Firebase
// Using v8 check to avoid double initialization
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const db = firebase.firestore();

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
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    // If user not found or invalid credential (which might mean user not found in newer API), try to register
    if (
      error.code === 'auth/user-not-found' || 
      error.code === 'auth/invalid-credential' || 
      error.code === 'auth/wrong-password'
    ) {
      try {
        return await auth.createUserWithEmailAndPassword(email, password);
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

export { firebase, auth, db };