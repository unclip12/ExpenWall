import { db } from "../firebase";
import { Transaction, UserProfile, BuyingItem, MerchantRule, Wallet } from "../types";
import firebase from "firebase/compat/app";

const COLLECTIONS = {
  TRANSACTIONS: "transactions",
  BUYING_LIST: "buying_list",
  USERS: "users",
  RULES: "merchant_rules",
  WALLETS: "wallets",
} as const;

// --- Transactions ---

export const subscribeToTransactions = (userId: string, onUpdate: (data: Transaction[]) => void): () => void => {
  if (!db) {
    console.warn("Firestore is not initialized");
    return () => {};
  }

  return db.collection(COLLECTIONS.TRANSACTIONS)
    .where("userId", "==", userId)
    .orderBy("date", "desc")
    .onSnapshot(
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        onUpdate(transactions);
      },
      (error) => console.error("Error fetching transactions:", error)
    );
};

export const addTransactionToDb = async (transaction: Omit<Transaction, "id">, userId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  if (!userId) throw new Error("User ID is required");

  await db.collection(COLLECTIONS.TRANSACTIONS).add({
    ...transaction,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const addTransactionsBatch = async (transactions: Omit<Transaction, "id">[], userId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  if (!userId) throw new Error("User ID is required");

  const batch = db.batch();
  transactions.forEach(transaction => {
    const docRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();
    batch.set(docRef, {
      ...transaction,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
};

export const updateTransactionInDb = async (transactionId: string, updates: Partial<Transaction>): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).update(updates);
};

export const deleteTransactionFromDb = async (transactionId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).delete();
};

// --- Wallets ---

export const subscribeToWallets = (userId: string, onUpdate: (data: Wallet[]) => void): () => void => {
  if (!db) return () => {};
  return db.collection(COLLECTIONS.WALLETS)
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        const wallets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallet[];
        onUpdate(wallets);
      },
      (err) => console.error("Wallet fetch error:", err)
    );
};

export const addWalletToDb = async (wallet: Omit<Wallet, "id">, userId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.WALLETS).add({
    ...wallet,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const deleteWalletFromDb = async (walletId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.WALLETS).doc(walletId).delete();
};

// --- Buying List ---

export const subscribeToBuyingList = (userId: string, onUpdate: (data: BuyingItem[]) => void): () => void => {
  if (!db) return () => {};

  return db.collection(COLLECTIONS.BUYING_LIST)
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isBought: data.isBought ?? false,
            estimatedPrice: data.estimatedPrice ?? 0,
            name: data.name ?? 'Unknown Item'
          };
        }) as BuyingItem[];

        // Sort: unbought first, then by createdAt descending
        items.sort((a, b) => {
          if (a.isBought !== b.isBought) return a.isBought ? 1 : -1;
          const getMillis = (t: any): number => {
            if (!t) return Date.now() + 1000;
            if (typeof t.toMillis === 'function') return t.toMillis();
            if (typeof t.seconds === 'number') return t.seconds * 1000;
            return 0;
          };
          return getMillis(b.createdAt) - getMillis(a.createdAt);
        });

        onUpdate(items);
      },
      (error) => console.error("Error fetching buying list:", error)
    );
};

export const addBuyingItem = async (item: Omit<BuyingItem, "id" | "userId">, userId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  if (!userId) throw new Error("User ID is required");

  await db.collection(COLLECTIONS.BUYING_LIST).add({
    ...item,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateBuyingItemStatus = async (itemId: string, isBought: boolean): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.BUYING_LIST).doc(itemId).update({ isBought });
};

export const deleteBuyingItem = async (itemId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.BUYING_LIST).doc(itemId).delete();
};

// --- User Profile ---

export const saveUserApiKey = async (userId: string, apiKey: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.USERS).doc(userId).set({
    apiKey,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  return doc.exists ? (doc.data() as UserProfile) : null;
};

// --- Merchant Rules ---

export const subscribeToRules = (userId: string, onUpdate: (rules: MerchantRule[]) => void): () => void => {
  if (!db) return () => {};
  return db.collection(COLLECTIONS.RULES)
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        const rules = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MerchantRule[];
        onUpdate(rules);
      },
      (err) => console.error("Rules fetch error:", err)
    );
};

export const addMerchantRule = async (rule: Omit<MerchantRule, "id">): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.RULES).add({
    ...rule,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const deleteMerchantRule = async (ruleId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(COLLECTIONS.RULES).doc(ruleId).delete();
};