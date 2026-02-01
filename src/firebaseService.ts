import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase';  // From your firebase.txt

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const FirebaseService = {
  auth,
  firestore,
  initialize: async () => { console.log('Firebase ready!'); }
};
