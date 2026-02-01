
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth: firebase.auth.Auth;
let db: firebase.firestore.Firestore;

try {
  if (firebaseConfig.apiKey) {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    auth = firebase.auth();
    db = firebase.firestore();
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

export const loginWithSecretId = async (secretId: string) => {
  if (!auth) throw new Error("Firebase auth is not initialized. Check your API keys.");
  const sanitizedId = secretId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (sanitizedId.length < 3) throw new Error("Secret ID must be at least 3 alphanumeric characters.");
  const email = `${sanitizedId}@expenwall.app`;
  const password = `pass_${sanitizedId}`;

  try {
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return await auth.createUserWithEmailAndPassword(email, password);
    }
    throw error;
  }
};

export { app, auth, db };
