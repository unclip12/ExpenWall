import { Category, Transaction, Wallet, BuyingItem } from '../types';
import { addTransactionsBatch, addWalletToDb, addBuyingItem } from './firestoreService';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';

// Helper to generate dates from last 3 months
const getRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Check if user already has data
export const checkIfFirstTimeUser = async (userId: string): Promise<boolean> => {
  try {
    const snapshot = await db.collection('transactions').where('userId', '==', userId).limit(1).get();
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking first time user:', error);
    return false;
  }
};

// Mark user as initialized
export const markUserAsInitialized = async (userId: string) => {
  try {
    await db.collection('userProfiles').doc(userId).set({ 
      seedDataInitialized: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    console.error('Error marking user as initialized:', error);
  }
};

// Check if seed data was already initialized
export const isSeedDataInitialized = async (userId: string): Promise<boolean> => {
  try {
    const doc = await db.collection('userProfiles').doc(userId).get();
    const data = doc.data();
    return data?.seedDataInitialized === true;
  } catch (error) {
    console.error('Error checking seed data initialization:', error);
    return false;
  }
};

// Generate comprehensive seed data
export const generateSeedData = (): Omit<Transaction, 'id'>[] => {
  const transactions: Omit<Transaction, 'id'>[] = [];

  // ============ GROCERIES - DMART (15 transactions) ============
  transactions.push({
    merchant: 'DMart',
    merchantEmoji: '🛒',
    shopLocation: { shopName: 'DMart', area: 'Benz Circle', city: 'Vijayawada', lastVisited: getRandomDate(2) },
    date: getRandomDate(2),
    time: '18:30',
    amount: 2847.50,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 135, quantity: 3, mrp: 150, discount: 45, pricePerUnit: 45 },
      { name: 'Tata Salt', brand: 'Tata', price: 22, quantity: 2, weight: 1, weightUnit: 'kg', pricePerUnit: 22 },
      { name: 'Fortune Sunflower Oil', brand: 'Fortune', price: 185, quantity: 2, weight: 1, weightUnit: 'litre', mrp: 195 },
      { name: 'Amul Milk', brand: 'Amul', price: 58, quantity: 4, weight: 1, weightUnit: 'litre' },
      { name: 'Britannia Good Day', brand: 'Britannia', price: 35, quantity: 5, weight: 100, weightUnit: 'gram' },
      { name: 'Colgate MaxFresh', brand: 'Colgate', price: 178, quantity: 2, mrp: 200 },
      { name: 'Pantene Shampoo', brand: 'Pantene', price: 245, quantity: 1, weight: 340, weightUnit: 'ml' },
      { name: 'Vim Dishwash Bar', brand: 'Vim', price: 22, quantity: 4 },
      { name: 'Harpic Toilet Cleaner', brand: 'Harpic', price: 185, quantity: 2 },
      { name: 'Maggi Noodles', brand: 'Maggi', price: 140, quantity: 10, weight: 70, weightUnit: 'gram' },
      { name: 'Red Label Tea', brand: 'Red Label', price: 295, quantity: 1, weight: 1, weightUnit: 'kg' },
      { name: 'Parle-G Biscuits', brand: 'Parle', price: 10, quantity: 10, weight: 100, weightUnit: 'gram' },
      { name: 'Surf Excel Detergent', brand: 'Surf Excel', price: 425, quantity: 1, weight: 2, weightUnit: 'kg' },
    ],
    notes: 'Monthly grocery shopping',
  });

  transactions.push({
    merchant: 'DMart',
    merchantEmoji: '🛒',
    shopLocation: { shopName: 'DMart', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(32),
    time: '19:15',
    amount: 1245.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 150, quantity: 2, mrp: 150, pricePerUnit: 75 },
      { name: 'Lays Chips', brand: 'Lays', price: 20, quantity: 10, weight: 52, weightUnit: 'gram' },
      { name: 'Bingo Mad Angles', brand: 'Bingo', price: 25, quantity: 6 },
      { name: 'Nescafe Coffee', brand: 'Nescafe', price: 385, quantity: 1, weight: 200, weightUnit: 'gram' },
      { name: 'Dairy Milk Chocolate', brand: 'Cadbury', price: 50, quantity: 8 },
    ],
  });

  transactions.push({
    merchant: 'DMart',
    merchantEmoji: '🛒',
    shopLocation: { shopName: 'DMart', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(58),
    time: '17:45',
    amount: 890.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 180, quantity: 1, mrp: 180, pricePerUnit: 180 },
      { name: 'Fair & Lovely Cream', brand: 'Fair & Lovely', price: 145, quantity: 2 },
      { name: 'Ponds Talcum Powder', brand: 'Ponds', price: 125, quantity: 1 },
      { name: 'Closeup Toothpaste', brand: 'Closeup', price: 95, quantity: 2 },
      { name: 'Dettol Soap', brand: 'Dettol', price: 45, quantity: 4 },
    ],
  });

  // ============ GROCERIES - JIOMART (12 transactions) ============
  transactions.push({
    merchant: 'JioMart',
    merchantEmoji: '🛍️',
    shopLocation: { shopName: 'JioMart', city: 'Vijayawada' },
    date: getRandomDate(5),
    time: '14:20',
    amount: 1847.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 130, quantity: 3, mrp: 145, discount: 45, pricePerUnit: 43.33 },
      { name: 'Fortune Rice', brand: 'Fortune', price: 485, quantity: 1, weight: 5, weightUnit: 'kg' },
      { name: 'Toor Dal', brand: 'Fortune', price: 145, quantity: 2, weight: 1, weightUnit: 'kg' },
      { name: 'Moong Dal', brand: 'Tata Sampann', price: 165, quantity: 1, weight: 1, weightUnit: 'kg' },
      { name: 'Atta Flour', brand: 'Aashirvaad', price: 395, quantity: 1, weight: 5, weightUnit: 'kg' },
      { name: 'Kitchen King Masala', brand: 'MDH', price: 75, quantity: 2 },
      { name: 'Turmeric Powder', brand: 'Everest', price: 45, quantity: 2 },
    ],
    notes: 'Free delivery',
  });

  transactions.push({
    merchant: 'JioMart',
    merchantEmoji: '🛍️',
    shopLocation: { shopName: 'JioMart', city: 'Vijayawada' },
    date: getRandomDate(35),
    time: '11:30',
    amount: 945.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 155, quantity: 2, pricePerUnit: 77.5 },
      { name: 'Real Fruit Juice', brand: 'Real', price: 135, quantity: 3, weight: 1, weightUnit: 'litre' },
      { name: 'Tropicana Juice', brand: 'Tropicana', price: 145, quantity: 1, weight: 1, weightUnit: 'litre' },
      { name: 'Kurkure', brand: 'Kurkure', price: 20, quantity: 10 },
    ],
  });

  // ============ QUICK COMMERCE - ZEPTO (10 transactions) ============
  transactions.push({
    merchant: 'Zepto',
    merchantEmoji: '⚡',
    shopLocation: { shopName: 'Zepto', city: 'Vijayawada' },
    date: getRandomDate(1),
    time: '21:45',
    amount: 245.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Amul Butter', brand: 'Amul', price: 54, quantity: 2 },
      { name: 'Bread', brand: 'Modern', price: 45, quantity: 2 },
      { name: 'Milk', brand: 'Amul', price: 54, quantity: 1, weight: 1, weightUnit: 'litre' },
      { name: 'Eggs', brand: 'Venkys', price: 70, quantity: 1, weight: 6, weightUnit: 'piece' },
    ],
    notes: '10-min delivery',
  });

  // ============ FOOD & DINING (10 transactions) ============
  transactions.push({
    merchant: 'Swiggy',
    merchantEmoji: '🍔',
    date: getRandomDate(0),
    time: '21:00',
    amount: 485.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    notes: 'Biryani from Paradise',
  });

  transactions.push({
    merchant: 'Zomato',
    merchantEmoji: '🍕',
    date: getRandomDate(3),
    time: '20:30',
    amount: 625.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    notes: 'Pizza from Dominos',
  });

  transactions.push({
    merchant: 'McDonald\'s',
    merchantEmoji: '🍔',
    shopLocation: { shopName: 'McDonald\'s', area: 'PVP Square Mall', city: 'Vijayawada' },
    date: getRandomDate(6),
    time: '19:00',
    amount: 545.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
  });

  // ============ TRANSPORTATION (10 transactions) ============
  transactions.push({
    merchant: 'Rapido',
    merchantEmoji: '🛵',
    date: getRandomDate(1),
    time: '09:30',
    amount: 67.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Bike taxi to office',
  });

  transactions.push({
    merchant: 'Rapido',
    merchantEmoji: '🛵',
    date: getRandomDate(3),
    time: '18:45',
    amount: 72.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Bike ride home',
  });

  transactions.push({
    merchant: 'Uber',
    merchantEmoji: '🚗',
    date: getRandomDate(5),
    time: '22:30',
    amount: 245.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Late night ride',
  });

  // ============ ONLINE SHOPPING - FLIPKART (5 transactions) ============
  transactions.push({
    merchant: 'Flipkart',
    merchantEmoji: '📦',
    date: getRandomDate(8),
    time: '14:20',
    amount: 2499.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    notes: 'boAt Airdopes + Fire-Boltt Watch',
  });

  transactions.push({
    merchant: 'Flipkart',
    merchantEmoji: '📦',
    date: getRandomDate(28),
    time: '16:45',
    amount: 1899.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    notes: 'Clothing - Puma T-shirts',
  });

  // ============ ONLINE SHOPPING - AMAZON (5 transactions) ============
  transactions.push({
    merchant: 'Amazon',
    merchantEmoji: '📦',
    date: getRandomDate(12),
    time: '22:30',
    amount: 1299.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    notes: 'Keyboard + Mouse combo',
  });

  // ============ UTILITIES (5 transactions) ============
  transactions.push({
    merchant: 'APEPDCL',
    merchantEmoji: '⚡',
    date: getRandomDate(20),
    time: '15:00',
    amount: 1245.00,
    currency: 'INR',
    category: Category.UTILITIES,
    type: 'expense',
    notes: 'Electricity bill',
  });

  transactions.push({
    merchant: 'Jio Fiber',
    merchantEmoji: '📡',
    date: getRandomDate(15),
    time: '10:00',
    amount: 899.00,
    currency: 'INR',
    category: Category.UTILITIES,
    type: 'expense',
    notes: 'Monthly broadband',
  });

  // ============ ENTERTAINMENT (5 transactions) ============
  transactions.push({
    merchant: 'Netflix',
    merchantEmoji: '📺',
    date: getRandomDate(30),
    time: '23:00',
    amount: 649.00,
    currency: 'INR',
    category: Category.ENTERTAINMENT,
    type: 'expense',
    notes: 'Monthly subscription',
  });

  transactions.push({
    merchant: 'Amazon Prime',
    merchantEmoji: '🎥',
    date: getRandomDate(45),
    time: '18:00',
    amount: 299.00,
    currency: 'INR',
    category: Category.ENTERTAINMENT,
    type: 'expense',
    notes: 'Quarterly subscription',
  });

  // ============ INCOME TRANSACTIONS (3 transactions) ============
  transactions.push({
    merchant: 'Salary',
    merchantEmoji: '💰',
    date: getRandomDate(5),
    time: '00:00',
    amount: 45000.00,
    currency: 'INR',
    category: Category.INCOME,
    type: 'income',
    notes: 'Monthly salary',
  });

  transactions.push({
    merchant: 'Freelance Project',
    merchantEmoji: '💼',
    date: getRandomDate(18),
    time: '14:00',
    amount: 15000.00,
    currency: 'INR',
    category: Category.INCOME,
    type: 'income',
    notes: 'Website development',
  });

  // Add more varied transactions
  for (let i = 0; i < 20; i++) {
    const merchants = ['Swiggy', 'Zomato', 'Rapido', 'Ola', 'DMart', 'JioMart', 'Zepto'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const isFood = merchant === 'Swiggy' || merchant === 'Zomato';
    const isTransport = merchant === 'Rapido' || merchant === 'Ola';
    
    transactions.push({
      merchant,
      merchantEmoji: isFood ? '🍔' : isTransport ? '🛵' : '🛒',
      date: getRandomDate(Math.floor(Math.random() * 90)),
      time: getRandomTime(),
      amount: Math.floor(Math.random() * 500) + 100,
      currency: 'INR',
      category: isFood ? Category.FOOD : isTransport ? Category.TRANSPORT : Category.GROCERIES,
      type: 'expense',
    });
  }

  return transactions;
};

// Initialize seed data for new user
export const initializeSeedData = async (userId: string) => {
  try {
    console.log('🔍 Checking seed data initialization...');

    // Check if already initialized
    const alreadyInitialized = await isSeedDataInitialized(userId);
    if (alreadyInitialized) {
      console.log('✅ Seed data already initialized for this user');
      return;
    }

    // Check if user is actually first time (no transactions)
    const isFirstTime = await checkIfFirstTimeUser(userId);
    if (!isFirstTime) {
      console.log('ℹ️ User already has transactions');
      await markUserAsInitialized(userId);
      return;
    }

    console.log('🚀 Initializing seed data for new user...');

    // Generate and add transactions
    const seedTransactions = generateSeedData();
    console.log(`📊 Generated ${seedTransactions.length} transactions`);
    
    await addTransactionsBatch(seedTransactions, userId);
    console.log('✅ Transactions added');

    // Add default wallets
    const defaultWallets: Omit<Wallet, 'id'>[] = [
      { name: 'Cash', type: 'cash', color: '#10b981' },
      { name: 'SBI Bank', type: 'bank', color: '#3b82f6' },
      { name: 'HDFC Credit Card', type: 'credit', color: '#8b5cf6' },
      { name: 'Paytm', type: 'digital', color: '#06b6d4' },
      { name: 'PhonePe', type: 'digital', color: '#7c3aed' },
      { name: 'Google Pay', type: 'digital', color: '#f59e0b' },
    ];

    for (const wallet of defaultWallets) {
      await addWalletToDb(wallet, userId);
    }
    console.log('✅ Wallets added');

    // Add sample buying list items
    const buyingItems: Omit<BuyingItem, 'id'>[] = [
      { name: 'New Headphones', estimatedPrice: 2000, currency: 'INR', isBought: false },
      { name: 'Running Shoes', estimatedPrice: 3500, currency: 'INR', isBought: false },
      { name: 'Laptop Bag', estimatedPrice: 1500, currency: 'INR', isBought: false },
    ];

    for (const item of buyingItems) {
      await addBuyingItem(item, userId);
    }
    console.log('✅ Buying list items added');

    // Mark as initialized
    await markUserAsInitialized(userId);

    console.log('✅ Seed data initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing seed data:', error);
    // Don't throw error to prevent app from breaking
  }
};

// Reset app data (for settings)
export const resetAppData = async (userId: string) => {
  try {
    console.log('🗑️ Resetting app data...');

    // Helper function to delete collection in batches
    const deleteCollection = async (collectionName: string) => {
      const snapshot = await db.collection(collectionName).where('userId', '==', userId).get();
      
      if (snapshot.empty) {
        console.log(`ℹ️ No ${collectionName} to delete`);
        return;
      }

      // Delete in batches of 500 (Firestore limit)
      const batchSize = 500;
      const batches = [];
      
      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const docsToDelete = snapshot.docs.slice(i, i + batchSize);
        
        docsToDelete.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        batches.push(batch.commit());
      }

      await Promise.all(batches);
      console.log(`✅ Deleted ${snapshot.docs.length} ${collectionName}`);
    };

    // Delete all collections
    await deleteCollection('transactions');
    await deleteCollection('wallets');
    await deleteCollection('buyingList');
    await deleteCollection('products');
    await deleteCollection('priceHistory');
    await deleteCollection('budgets');
    await deleteCollection('recurringTransactions');
    await deleteCollection('merchantRules');

    // Reset user profile
    await db.collection('userProfiles').doc(userId).set({ 
      seedDataInitialized: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });

    console.log('✅ App data reset successfully!');
  } catch (error) {
    console.error('❌ Error resetting app data:', error);
    throw error;
  }
};
