import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Transaction, 
  MerchantRule, 
  BuyingItem, 
  Wallet, 
  RecurringTransaction, 
  Budget,
  UserProfile,
  Product,
  PriceHistory
} from '../types';

// TRANSACTIONS
export const subscribeToTransactions = (userId: string, callback: (data: Transaction[]) => void) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    callback(data);
  });
};

export const addTransactionToDb = async (transaction: Omit<Transaction, 'id'>, userId: string) => {
  await addDoc(collection(db, 'transactions'), { ...transaction, userId });
};

export const addTransactionsBatch = async (transactions: Omit<Transaction, 'id'>[], userId: string) => {
  const batch = writeBatch(db);
  transactions.forEach(tx => {
    const ref = doc(collection(db, 'transactions'));
    batch.set(ref, { ...tx, userId });
  });
  await batch.commit();
};

export const updateTransaction = async (id: string, data: Partial<Transaction>) => {
  await updateDoc(doc(db, 'transactions', id), data);
};

export const deleteTransaction = async (id: string) => {
  await deleteDoc(doc(db, 'transactions', id));
};

// MERCHANT RULES
export const subscribeToRules = (userId: string, callback: (data: MerchantRule[]) => void) => {
  const q = query(collection(db, 'merchantRules'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MerchantRule));
    callback(data);
  });
};

export const addMerchantRule = async (rule: Omit<MerchantRule, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'merchantRules'), { ...rule, userId });
};

export const deleteMerchantRule = async (id: string) => {
  await deleteDoc(doc(db, 'merchantRules', id));
};

// BUYING LIST
export const subscribeToBuyingList = (userId: string, callback: (data: BuyingItem[]) => void) => {
  const q = query(collection(db, 'buyingList'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyingItem));
    callback(data);
  });
};

export const addBuyingItem = async (item: Omit<BuyingItem, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'buyingList'), { ...item, userId });
};

export const updateBuyingItem = async (id: string, data: Partial<BuyingItem>) => {
  await updateDoc(doc(db, 'buyingList', id), data);
};

export const deleteBuyingItem = async (id: string) => {
  await deleteDoc(doc(db, 'buyingList', id));
};

// WALLETS
export const subscribeToWallets = (userId: string, callback: (data: Wallet[]) => void) => {
  const q = query(collection(db, 'wallets'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wallet));
    callback(data);
  });
};

export const addWalletToDb = async (wallet: Omit<Wallet, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'wallets'), { ...wallet, userId });
};

export const deleteWalletFromDb = async (id: string) => {
  await deleteDoc(doc(db, 'wallets', id));
};

// RECURRING TRANSACTIONS
export const subscribeToRecurringTransactions = (userId: string, callback: (data: RecurringTransaction[]) => void) => {
  const q = query(collection(db, 'recurringTransactions'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTransaction));
    callback(data);
  });
};

export const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'recurringTransactions'), { ...recurring, userId });
};

export const toggleRecurringActive = async (id: string, isActive: boolean) => {
  await updateDoc(doc(db, 'recurringTransactions', id), { isActive });
};

export const deleteRecurringTransaction = async (id: string) => {
  await deleteDoc(doc(db, 'recurringTransactions', id));
};

// BUDGETS
export const subscribeToBudgets = (userId: string, callback: (data: Budget[]) => void) => {
  const q = query(collection(db, 'budgets'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
    callback(data);
  });
};

export const addBudget = async (budget: Omit<Budget, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'budgets'), { ...budget, userId });
};

export const updateBudget = async (id: string, data: Partial<Budget>) => {
  await updateDoc(doc(db, 'budgets', id), data);
};

export const deleteBudget = async (id: string) => {
  await deleteDoc(doc(db, 'budgets', id));
};

// USER PROFILE
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'userProfiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
};

export const saveUserApiKey = async (userId: string, apiKey: string) => {
  await setDoc(doc(db, 'userProfiles', userId), { apiKey, updatedAt: new Date() }, { merge: true });
};

export const saveUserTheme = async (userId: string, theme: string) => {
  await setDoc(doc(db, 'userProfiles', userId), { theme, updatedAt: new Date() }, { merge: true });
};

export const saveUserAISettings = async (userId: string, settings: Partial<UserProfile>) => {
  await setDoc(doc(db, 'userProfiles', userId), { ...settings, updatedAt: new Date() }, { merge: true });
};

// PRODUCTS (Price Tracking)
export const subscribeToProducts = (userId: string, callback: (data: Product[]) => void) => {
  const q = query(collection(db, 'products'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(data);
  });
};

export const addOrUpdateProduct = async (product: Omit<Product, 'id' | 'userId'>, userId: string) => {
  const q = query(
    collection(db, 'products'),
    where('userId', '==', userId),
    where('name', '==', product.name)
  );
  
  const snapshot = await getDoc(q as any);
  if (snapshot.exists()) {
    await updateDoc(doc(db, 'products', snapshot.id), product);
  } else {
    await addDoc(collection(db, 'products'), { ...product, userId });
  }
};

// PRICE HISTORY
export const addPriceHistory = async (priceHistory: Omit<PriceHistory, 'id' | 'userId'>, userId: string) => {
  await addDoc(collection(db, 'priceHistory'), { ...priceHistory, userId });
};

export const getPriceHistory = async (userId: string, productName: string): Promise<PriceHistory[]> => {
  const q = query(
    collection(db, 'priceHistory'),
    where('userId', '==', userId),
    where('productName', '==', productName),
    orderBy('date', 'desc')
  );
  
  return new Promise((resolve) => {
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceHistory));
      resolve(data);
    });
  });
};