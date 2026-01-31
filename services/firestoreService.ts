import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { Transaction } from "../types";

const COLLECTION_NAME = "transactions";

/**
 * Subscribes to the transactions collection for a specific user.
 * Sorting is done client-side to avoid needing a composite index immediately.
 */
export const subscribeToTransactions = (userId: string, onUpdate: (data: Transaction[]) => void) => {
  // Query only the current user's transactions
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
  
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    // Sort by date descending (newest first) in memory
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    onUpdate(transactions);
  }, (error) => {
    console.error("Error fetching transactions:", error);
    if (error.code === 'permission-denied') {
      console.warn("Permission denied. Please ensure your Firestore Security Rules allow access to the 'transactions' collection for authenticated users.");
    }
  });
};

/**
 * Adds a new transaction to Firestore for the specific user.
 */
export const addTransactionToDb = async (transaction: Omit<Transaction, "id">, userId: string) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...transaction,
      userId,
      createdAt: new Date() // Useful for debugging or sorting by insertion time later
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};