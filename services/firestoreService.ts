import { db } from "../firebase";
import { Transaction, UserProfile } from "../types";
import firebase from "firebase/compat/app";

const COLLECTION_NAME = "transactions";
const USERS_COLLECTION = "users";

/**
 * Subscribes to the transactions collection for a specific user.
 * Sorting is done client-side to avoid needing a composite index immediately.
 */
export const subscribeToTransactions = (userId: string, onUpdate: (data: Transaction[]) => void) => {
  if (!db) {
    console.warn("Firestore is not initialized");
    return () => {};
  }

  // v8 Syntax: db.collection(...)
  return db.collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .onSnapshot((snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      // Sort by date descending (newest first) in memory
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      onUpdate(transactions);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      if ((error as any).code === 'permission-denied') {
        console.warn("Permission denied. Please ensure your Firestore Security Rules allow access to the 'transactions' collection for authenticated users.");
      }
    });
};

/**
 * Adds a new transaction to Firestore for the specific user.
 */
export const addTransactionToDb = async (transaction: Omit<Transaction, "id">, userId: string) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    await db.collection(COLLECTION_NAME).add({
      ...transaction,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() // Uses server timestamp (v8 syntax)
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

/**
 * Saves the user's API Key to their profile document.
 */
export const saveUserApiKey = async (userId: string, apiKey: string) => {
  if (!db) throw new Error("Firestore not initialized");
  
  await db.collection(USERS_COLLECTION).doc(userId).set({
    apiKey,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
};

/**
 * Retrieves the user's API Key.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) return null;
  
  try {
    const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
    if (doc.exists) {
      return doc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};