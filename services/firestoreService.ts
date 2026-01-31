import { db } from "../firebase";
import { Transaction, UserProfile, BuyingItem } from "../types";
import firebase from "firebase/compat/app";

const COLLECTION_NAME = "transactions";
const BUYING_COLLECTION = "buying_list";
const USERS_COLLECTION = "users";

// --- Transactions ---

export const subscribeToTransactions = (userId: string, onUpdate: (data: Transaction[]) => void) => {
  if (!db) {
    console.warn("Firestore is not initialized");
    return () => {};
  }

  return db.collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .onSnapshot((snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      onUpdate(transactions);
    }, (error) => {
      console.error("Error fetching transactions:", error);
    });
};

export const addTransactionToDb = async (transaction: Omit<Transaction, "id">, userId: string) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    await db.collection(COLLECTION_NAME).add({
      ...transaction,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

// --- Buying List ---

export const subscribeToBuyingList = (userId: string, onUpdate: (data: BuyingItem[]) => void) => {
  if (!db) return () => {};

  return db.collection(BUYING_COLLECTION)
    .where("userId", "==", userId)
    .onSnapshot((snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BuyingItem[];
      
      // Sort: Unbought first, then by creation time (Newest first)
      items.sort((a, b) => {
        if (a.isBought === b.isBought) {
          // Handle null createdAt (pending local write) -> treat as now (Infinity for sorting desc)
          // Timestamps from Firestore have .toMillis(), or might be null if serverTimestamp hasn't resolved locally
          const timeA = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : Date.now();
          return timeB - timeA;
        }
        return a.isBought ? 1 : -1; // Unbought (false) comes before Bought (true)
      });

      onUpdate(items);
    }, (error) => {
      console.error("Error fetching buying list:", error);
    });
};

export const addBuyingItem = async (item: Omit<BuyingItem, "id" | "userId">, userId: string) => {
  if (!db) throw new Error("Firestore not initialized");
  
  await db.collection(BUYING_COLLECTION).add({
    ...item,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateBuyingItemStatus = async (itemId: string, isBought: boolean) => {
  if (!db) return;
  await db.collection(BUYING_COLLECTION).doc(itemId).update({ isBought });
};

export const deleteBuyingItem = async (itemId: string) => {
  if (!db) return;
  await db.collection(BUYING_COLLECTION).doc(itemId).delete();
};

// --- User Profile ---

export const saveUserApiKey = async (userId: string, apiKey: string) => {
  if (!db) throw new Error("Firestore not initialized");
  
  await db.collection(USERS_COLLECTION).doc(userId).set({
    apiKey,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
};

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