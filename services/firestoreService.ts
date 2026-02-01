
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { Transaction, BuyingItem, MerchantRule, Wallet, UserProfile, RecurringTransaction, Budget, Product, PriceHistory } from '../types';

// ==================== TRANSACTIONS ====================

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
): (() => void) => {
  return db
    .collection('transactions')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const transactions: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      callback(transactions);
    });
};

export const addTransactionToDb = async (transaction: Omit<Transaction, 'id'>, userId: string) => {
  await db.collection('transactions').add({
    ...transaction,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const addTransactionsBatch = async (transactions: Omit<Transaction, 'id'>[], userId: string) => {
  const batch = db.batch();
  transactions.forEach((tx) => {
    const ref = db.collection('transactions').doc();
    batch.set(ref, {
      ...tx,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  await db.collection('transactions').doc(id).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteTransaction = async (id: string) => {
  await db.collection('transactions').doc(id).delete();
};

// ==================== RECURRING TRANSACTIONS ====================

export const subscribeToRecurringTransactions = (
  userId: string,
  callback: (recurring: RecurringTransaction[]) => void
): (() => void) => {
  return db
    .collection('recurring_transactions')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const recurring: RecurringTransaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RecurringTransaction[];
      callback(recurring);
    });
};

export const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id'>, userId: string) => {
  await db.collection('recurring_transactions').add({
    ...recurring,
    userId,
    isActive: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransaction>) => {
  await db.collection('recurring_transactions').doc(id).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteRecurringTransaction = async (id: string) => {
  await db.collection('recurring_transactions').doc(id).delete();
};

export const toggleRecurringActive = async (id: string, isActive: boolean) => {
  await db.collection('recurring_transactions').doc(id).update({ isActive });
};

// ==================== BUDGETS ====================

export const subscribeToBudgets = (
  userId: string,
  callback: (budgets: Budget[]) => void
): (() => void) => {
  return db
    .collection('budgets')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const budgets: Budget[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Budget[];
      callback(budgets);
    });
};

export const addBudget = async (budget: Omit<Budget, 'id'>, userId: string) => {
  await db.collection('budgets').add({
    ...budget,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const updateBudget = async (id: string, updates: Partial<Budget>) => {
  await db.collection('budgets').doc(id).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteBudget = async (id: string) => {
  await db.collection('budgets').doc(id).delete();
};

// ==================== BUYING LIST ====================

export const subscribeToBuyingList = (
  userId: string,
  callback: (items: BuyingItem[]) => void
): (() => void) => {
  return db
    .collection('buying_list')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const items: BuyingItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BuyingItem[];
      callback(items);
    });
};

export const addBuyingItem = async (item: Omit<BuyingItem, 'id'>, userId: string) => {
  await db.collection('buying_list').add({
    ...item,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const updateBuyingItemStatus = async (id: string, isBought: boolean) => {
  await db.collection('buying_list').doc(id).update({ isBought });
};

export const deleteBuyingItem = async (id: string) => {
  await db.collection('buying_list').doc(id).delete();
};

// ==================== MERCHANT RULES ====================

export const subscribeToRules = (
  userId: string,
  callback: (rules: MerchantRule[]) => void
): (() => void) => {
  return db
    .collection('merchant_rules')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const rules: MerchantRule[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MerchantRule[];
      callback(rules);
    });
};

export const addMerchantRule = async (rule: Omit<MerchantRule, 'id'>) => {
  await db.collection('merchant_rules').add({
    ...rule,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteMerchantRule = async (id: string) => {
  await db.collection('merchant_rules').doc(id).delete();
};

// ==================== WALLETS ====================

export const subscribeToWallets = (
  userId: string,
  callback: (wallets: Wallet[]) => void
): (() => void) => {
  return db
    .collection('wallets')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const wallets: Wallet[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Wallet[];
      callback(wallets);
    });
};

export const addWalletToDb = async (wallet: Omit<Wallet, 'id'>, userId: string) => {
  await db.collection('wallets').add({
    ...wallet,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

export const deleteWalletFromDb = async (id: string) => {
  await db.collection('wallets').doc(id).delete();
};

// ==================== PRODUCTS & PRICES ====================

export const subscribeToProducts = (
  userId: string,
  callback: (products: Product[]) => void
): (() => void) => {
  return db
    .collection('products')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      const products: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      callback(products);
    });
};

// ==================== USER PROFILE ====================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? (doc.data() as UserProfile) : null;
};

export const saveUserApiKey = async (userId: string, apiKey: string) => {
  await db.collection('users').doc(userId).set(
    {
      apiKey,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveUserTheme = async (userId: string, theme: string) => {
  await db.collection('users').doc(userId).set(
    {
      theme,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};
