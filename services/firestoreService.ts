import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { 
  Transaction, 
  MerchantRule, 
  BuyingItem, 
  Wallet, 
  RecurringTransaction, 
  Budget,
  UserProfile,
  Product,
  PriceHistory,
  Craving,
  CravingOutcome
} from '../types';

// ==================== TRANSACTIONS ====================

export const subscribeToTransactions = (userId: string, callback: (data: Transaction[]) => void) => {
  return db.collection('transactions')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(data);
    });
};

export const addTransactionToDb = async (transaction: Omit<Transaction, 'id'>, userId: string) => {
  await db.collection('transactions').add({
    ...transaction,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const addTransactionsBatch = async (transactions: Omit<Transaction, 'id'>[], userId: string) => {
  const batch = db.batch();
  transactions.forEach(tx => {
    const ref = db.collection('transactions').doc();
    batch.set(ref, {
      ...tx,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  await db.collection('transactions').doc(id).update(data);
};

export const deleteTransaction = async (id: string) => {
  await db.collection('transactions').doc(id).delete();
};

// ==================== MERCHANT RULES ====================

export const subscribeToRules = (userId: string, callback: (data: MerchantRule[]) => void) => {
  return db.collection('merchantRules')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as MerchantRule));
      callback(data);
    });
};

export const addMerchantRule = async (rule: Omit<MerchantRule, 'id' | 'userId'>, userId: string) => {
  await db.collection('merchantRules').add({ ...rule, userId });
};

export const deleteMerchantRule = async (id: string) => {
  await db.collection('merchantRules').doc(id).delete();
};

// ==================== BUYING LIST ====================

export const subscribeToBuyingList = (userId: string, callback: (data: BuyingItem[]) => void) => {
  return db.collection('buyingList')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as BuyingItem));
      callback(data);
    });
};

export const addBuyingItem = async (item: Omit<BuyingItem, 'id' | 'userId'>, userId: string) => {
  await db.collection('buyingList').add({
    ...item,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateBuyingItem = async (id: string, data: Partial<BuyingItem>) => {
  await db.collection('buyingList').doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateBuyingItemStatus = async (id: string, isBought: boolean) => {
  await db.collection('buyingList').doc(id).update({ isBought });
};

export const deleteBuyingItem = async (id: string) => {
  await db.collection('buyingList').doc(id).delete();
};

// ==================== CRAVINGS ====================

export const subscribeToCravings = (userId: string, callback: (data: Craving[]) => void) => {
  return db.collection('cravings')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      // Sort in-memory instead of using orderBy to avoid composite index requirement
      const data = snapshot.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() } as Craving))
        .sort((a, b) => b.cravedAt.localeCompare(a.cravedAt));
      callback(data);
    });
};

export const addCraving = async (craving: Omit<Craving, 'id' | 'userId'>, userId: string) => {
  try {
    console.log('Adding craving:', { ...craving, userId });
    await db.collection('cravings').add({
      ...craving,
      userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Craving added successfully!');
  } catch (error) {
    console.error('Error adding craving to Firestore:', error);
    throw error;
  }
};

export const updateCravingOutcome = async (id: string, outcome: CravingOutcome) => {
  await db.collection('cravings').doc(id).update({
    outcome,
    resolvedAt: new Date().toISOString()
  });
};

export const deleteCraving = async (id: string) => {
  await db.collection('cravings').doc(id).delete();
};

// ==================== WALLETS ====================

export const subscribeToWallets = (userId: string, callback: (data: Wallet[]) => void) => {
  return db.collection('wallets')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Wallet));
      callback(data);
    });
};

export const addWalletToDb = async (wallet: Omit<Wallet, 'id' | 'userId'>, userId: string) => {
  await db.collection('wallets').add({
    ...wallet,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const deleteWalletFromDb = async (id: string) => {
  await db.collection('wallets').doc(id).delete();
};

// ==================== RECURRING TRANSACTIONS ====================

export const subscribeToRecurringTransactions = (userId: string, callback: (data: RecurringTransaction[]) => void) => {
  return db.collection('recurringTransactions')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as RecurringTransaction));
      callback(data);
    });
};

export const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id' | 'userId'>, userId: string) => {
  await db.collection('recurringTransactions').add({ ...recurring, userId });
};

export const toggleRecurringActive = async (id: string, isActive: boolean) => {
  await db.collection('recurringTransactions').doc(id).update({ isActive });
};

export const deleteRecurringTransaction = async (id: string) => {
  await db.collection('recurringTransactions').doc(id).delete();
};

// ==================== BUDGETS ====================

export const subscribeToBudgets = (userId: string, callback: (data: Budget[]) => void) => {
  return db.collection('budgets')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Budget));
      callback(data);
    });
};

export const addBudget = async (budget: Omit<Budget, 'id' | 'userId'>, userId: string) => {
  await db.collection('budgets').add({
    ...budget,
    userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

export const updateBudget = async (id: string, data: Partial<Budget>) => {
  await db.collection('budgets').doc(id).update(data);
};

export const deleteBudget = async (id: string) => {
  await db.collection('budgets').doc(id).delete();
};

// ==================== USER PROFILE ====================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const doc = await db.collection('userProfiles').doc(userId).get();
  return doc.exists ? (doc.data() as UserProfile) : null;
};

export const saveUserApiKey = async (userId: string, apiKey: string) => {
  await db.collection('userProfiles').doc(userId).set({ 
    apiKey, 
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
  }, { merge: true });
};

export const saveUserTheme = async (userId: string, theme: string) => {
  await db.collection('userProfiles').doc(userId).set({ 
    theme, 
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
  }, { merge: true });
};

export const saveUserAISettings = async (userId: string, settings: Partial<UserProfile>) => {
  await db.collection('userProfiles').doc(userId).set({
    ...settings,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
};

// ==================== PRODUCTS & PRICE HISTORY ====================

export const subscribeToProducts = (userId: string, callback: (data: Product[]) => void) => {
  return db.collection('products')
    .where('userId', '==', userId)
    .onSnapshot((snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Product));
      callback(data);
    });
};

export const addOrUpdateProduct = async (product: Omit<Product, 'id' | 'userId'>, userId: string) => {
  const snapshot = await db.collection('products')
    .where('userId', '==', userId)
    .where('name', '==', product.name)
    .get();

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    await db.collection('products').doc(docId).update(product);
  } else {
    await db.collection('products').add({ ...product, userId });
  }
};

export const addPriceHistory = async (priceHistory: Omit<PriceHistory, 'id' | 'userId'>, userId: string) => {
  await db.collection('priceHistory').add({ ...priceHistory, userId });
};

export const getPriceHistory = async (userId: string, productName: string): Promise<PriceHistory[]> => {
  const snapshot = await db.collection('priceHistory')
    .where('userId', '==', userId)
    .where('productName', '==', productName)
    .orderBy('date', 'desc')
    .get();
  
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as PriceHistory));
};