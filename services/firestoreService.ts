import { db } from "../firebase";
import { Transaction, UserProfile, BuyingItem, MerchantRule, Wallet } from "../types";
import firebase from "firebase/compat/app";

const COLLECTION_NAME = "transactions";
const BUYING_COLLECTION = "buying_list";
const USERS_COLLECTION = "users";
const RULES_COLLECTION = "merchant_rules";
const WALLETS_COLLECTION = "wallets";

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
  if (!userId) throw new Error("User ID is required to add transaction");

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

export const updateTransactionInDb = async (transactionId: string, updates: Partial<Transaction>) => {
    if (!db) return;
    try {
        await db.collection(COLLECTION_NAME).doc(transactionId).update(updates);
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
    }
}

// --- Wallets ---

export const subscribeToWallets = (userId: string, onUpdate: (data: Wallet[]) => void) => {
    if (!db) return () => {};
    return db.collection(WALLETS_COLLECTION)
        .where("userId", "==", userId)
        .onSnapshot(snapshot => {
            const wallets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Wallet[];
            onUpdate(wallets);
        }, err => console.error("Wallet fetch error", err));
};

export const addWalletToDb = async (wallet: Omit<Wallet, "id">, userId: string) => {
    if (!db) return;
    try {
        await db.collection(WALLETS_COLLECTION).add({
            ...wallet,
            userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error("Add wallet error", e);
        throw e;
    }
};

export const deleteWalletFromDb = async (walletId: string) => {
    if (!db) return;
    await db.collection(WALLETS_COLLECTION).doc(walletId).delete();
};

// --- Buying List ---

export const subscribeToBuyingList = (userId: string, onUpdate: (data: BuyingItem[]) => void) => {
  if (!db) return () => {};

  return db.collection(BUYING_COLLECTION)
    .where("userId", "==", userId)
    .onSnapshot((snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure essential fields exist to prevent UI crashes
            isBought: data.isBought ?? false,
            estimatedPrice: data.estimatedPrice ?? 0,
            name: data.name ?? 'Unknown Item'
        };
      }) as BuyingItem[];
      
      // Robust Sort: Unbought first, then by creation time (Newest first)
      items.sort((a, b) => {
        // 1. Sort by Status
        if (a.isBought !== b.isBought) {
          return a.isBought ? 1 : -1; // Unbought (false) comes first
        }
        
        // 2. Sort by Date (Newest first)
        const getMillis = (t: any) => {
          if (!t) return Date.now() + 1000; // Treat null/undefined (pending write) as VERY new
          if (typeof t.toMillis === 'function') return t.toMillis();
          if (typeof t.seconds === 'number') return t.seconds * 1000;
          return 0; // Fallback for bad data
        };

        const timeA = getMillis(a.createdAt);
        const timeB = getMillis(b.createdAt);
        
        return timeB - timeA;
      });

      onUpdate(items);
    }, (error) => {
      console.error("Error fetching buying list:", error);
    });
};

export const addBuyingItem = async (item: Omit<BuyingItem, "id" | "userId">, userId: string) => {
  if (!db) throw new Error("Firestore not initialized");
  if (!userId) throw new Error("User ID is required to add buying item");
  
  try {
    const payload = {
      ...item,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection(BUYING_COLLECTION).add(payload);
  } catch (error) {
    console.error("Error adding buying item:", error);
    throw error;
  }
};

export const updateBuyingItemStatus = async (itemId: string, isBought: boolean) => {
  if (!db) return;
  try {
      await db.collection(BUYING_COLLECTION).doc(itemId).update({ isBought });
  } catch (error) {
      console.error("Error updating buying item status:", error);
      throw error; // Re-throw to handle in UI if needed
  }
};

export const deleteBuyingItem = async (itemId: string) => {
  if (!db) return;
  try {
    await db.collection(BUYING_COLLECTION).doc(itemId).delete();
  } catch (error) {
    console.error("Error deleting buying item:", error);
    throw error;
  }
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

// --- Merchant Rules (Smart Aliases) ---

export const subscribeToRules = (userId: string, onUpdate: (rules: MerchantRule[]) => void) => {
    if (!db) return () => {};
    
    return db.collection(RULES_COLLECTION)
        .where("userId", "==", userId)
        .onSnapshot((snapshot) => {
            const rules = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MerchantRule[];
            onUpdate(rules);
        }, err => console.error("Rules fetch error:", err));
};

export const addMerchantRule = async (rule: Omit<MerchantRule, "id">) => {
    if (!db) return;
    try {
        await db.collection(RULES_COLLECTION).add({
            ...rule,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to add rule", e);
        throw e;
    }
};

export const deleteMerchantRule = async (ruleId: string) => {
    if(!db) return;
    await db.collection(RULES_COLLECTION).doc(ruleId).delete();
};