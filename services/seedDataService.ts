import { Category, Transaction, Wallet, Person, BuyingItem } from '../types';
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
  const snapshot = await db.collection('transactions').where('userId', '==', userId).limit(1).get();
  return snapshot.empty;
};

// Mark user as initialized
export const markUserAsInitialized = async (userId: string) => {
  await db.collection('userProfiles').doc(userId).set({ 
    seedDataInitialized: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
  }, { merge: true });
};

// Check if seed data was already initialized
export const isSeedDataInitialized = async (userId: string): Promise<boolean> => {
  const doc = await db.collection('userProfiles').doc(userId).get();
  const data = doc.data();
  return data?.seedDataInitialized === true;
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

  transactions.push({
    merchant: 'JioMart',
    merchantEmoji: '🛍️',
    shopLocation: { shopName: 'JioMart', city: 'Vijayawada' },
    date: getRandomDate(62),
    time: '16:00',
    amount: 1245.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Dove Soap', brand: 'Dove', price: 140, quantity: 2, pricePerUnit: 70 },
      { name: 'Head & Shoulders', brand: 'Head & Shoulders', price: 325, quantity: 1 },
      { name: 'Pears Soap', brand: 'Pears', price: 55, quantity: 5 },
      { name: 'Lux Soap', brand: 'Lux', price: 35, quantity: 6 },
      { name: 'Godrej No.1', brand: 'Godrej', price: 25, quantity: 10 },
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

  transactions.push({
    merchant: 'Zepto',
    merchantEmoji: '⚡',
    shopLocation: { shopName: 'Zepto', city: 'Vijayawada' },
    date: getRandomDate(7),
    time: '20:30',
    amount: 165.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    items: [
      { name: 'Maaza', brand: 'Maaza', price: 85, quantity: 1, weight: 1.2, weightUnit: 'litre' },
      { name: 'Kurkure', brand: 'Kurkure', price: 20, quantity: 4 },
    ],
  });

  transactions.push({
    merchant: 'Zepto',
    merchantEmoji: '⚡',
    shopLocation: { shopName: 'Zepto', city: 'Vijayawada' },
    date: getRandomDate(15),
    time: '22:00',
    amount: 385.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Happy Face Juice', brand: 'Paper Boat', price: 16, quantity: 6 },
      { name: 'Coke', brand: 'Coca Cola', price: 40, quantity: 4, weight: 750, weightUnit: 'ml' },
      { name: 'Lays', brand: 'Lays', price: 20, quantity: 5 },
      { name: 'Oreo Biscuits', brand: 'Oreo', price: 30, quantity: 3 },
    ],
  });

  // ============ INSTAMART (8 transactions) ============
  transactions.push({
    merchant: 'Instamart',
    merchantEmoji: '🛍️',
    shopLocation: { shopName: 'Instamart (Swiggy)', city: 'Vijayawada' },
    date: getRandomDate(4),
    time: '19:30',
    amount: 425.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Happy Face Juice', brand: 'Paper Boat', price: 19, quantity: 10 },
      { name: 'Coconut Water', brand: 'Real', price: 35, quantity: 5 },
      { name: 'Bisleri Water', brand: 'Bisleri', price: 20, quantity: 3, weight: 1, weightUnit: 'litre' },
    ],
  });

  transactions.push({
    merchant: 'Instamart',
    merchantEmoji: '🛍️',
    shopLocation: { shopName: 'Instamart (Swiggy)', city: 'Vijayawada' },
    date: getRandomDate(22),
    time: '18:45',
    amount: 545.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Ice Cream', brand: 'Amul', price: 85, quantity: 4 },
      { name: 'Curd', brand: 'Amul', price: 65, quantity: 2 },
      { name: 'Paneer', brand: 'Amul', price: 95, quantity: 1, weight: 200, weightUnit: 'gram' },
    ],
  });

  // ============ LOCAL SHOPS - VIJAYAWADA (15 transactions) ============
  transactions.push({
    merchant: 'Srinivasa Supermarket',
    merchantEmoji: '🏪',
    shopLocation: { shopName: 'Srinivasa Supermarket', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(10),
    time: '18:00',
    amount: 567.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Onions', price: 45, quantity: 2, weight: 1, weightUnit: 'kg' },
      { name: 'Tomatoes', price: 35, quantity: 2, weight: 1, weightUnit: 'kg' },
      { name: 'Potatoes', price: 28, quantity: 2, weight: 1, weightUnit: 'kg' },
      { name: 'Green Chilli', price: 25, quantity: 1, weight: 250, weightUnit: 'gram' },
      { name: 'Coriander', price: 20, quantity: 1, weight: 100, weightUnit: 'gram' },
      { name: 'Carrots', price: 45, quantity: 1, weight: 500, weightUnit: 'gram' },
      { name: 'Cabbage', price: 32, quantity: 1, weight: 1, weightUnit: 'kg' },
      { name: 'Cauliflower', price: 48, quantity: 1, weight: 1, weightUnit: 'kg' },
      { name: 'Beans', price: 65, quantity: 1, weight: 500, weightUnit: 'gram' },
      { name: 'Capsicum', price: 75, quantity: 1, weight: 250, weightUnit: 'gram' },
    ],
    notes: 'Fresh vegetables',
  });

  transactions.push({
    merchant: 'Raghavendra Kirana',
    merchantEmoji: '🏪',
    shopLocation: { shopName: 'Raghavendra Kirana', area: 'Governorpet', city: 'Vijayawada' },
    date: getRandomDate(18),
    time: '17:30',
    amount: 345.00,
    currency: 'INR',
    category: Category.GROCERIES,
    type: 'expense',
    items: [
      { name: 'Sugar', brand: 'Madhur', price: 48, quantity: 2, weight: 1, weightUnit: 'kg' },
      { name: 'Jaggery', price: 65, quantity: 1, weight: 1, weightUnit: 'kg' },
      { name: 'Coconut', price: 35, quantity: 3 },
      { name: 'Ginger', price: 85, quantity: 1, weight: 250, weightUnit: 'gram' },
    ],
  });

  transactions.push({
    merchant: 'Lakshmi Medical',
    merchantEmoji: '💊',
    shopLocation: { shopName: 'Lakshmi Medical', area: 'MG Road', city: 'Vijayawada' },
    date: getRandomDate(25),
    time: '10:30',
    amount: 845.00,
    currency: 'INR',
    category: Category.HEALTH,
    type: 'expense',
    items: [
      { name: 'Dolo 650', brand: 'Micro Labs', price: 35, quantity: 3 },
      { name: 'Vicks Vaporub', brand: 'Vicks', price: 135, quantity: 1 },
      { name: 'Crocin Advance', brand: 'GSK', price: 45, quantity: 2 },
      { name: 'ORS', brand: 'Electral', price: 25, quantity: 10 },
      { name: 'Vitamin C Tablets', brand: 'HealthVit', price: 245, quantity: 1 },
    ],
  });

  // ============ ONLINE SHOPPING - FLIPKART (12 transactions) ============
  transactions.push({
    merchant: 'Flipkart',
    merchantEmoji: '📦',
    date: getRandomDate(8),
    time: '14:20',
    amount: 2499.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'boAt Airdopes 141', brand: 'boAt', price: 1299, quantity: 1 },
      { name: 'Fire-Boltt Smartwatch', brand: 'Fire-Boltt', price: 1200, quantity: 1 },
    ],
    notes: 'Electronics sale',
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
    items: [
      { name: 'Puma T-Shirt', brand: 'Puma', price: 599, quantity: 2 },
      { name: 'Adidas Socks', brand: 'Adidas', price: 349, quantity: 2 },
    ],
  });

  transactions.push({
    merchant: 'Flipkart',
    merchantEmoji: '📦',
    date: getRandomDate(45),
    time: '11:00',
    amount: 4599.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'Redmi Powerbank', brand: 'Mi', price: 1299, quantity: 1 },
      { name: 'USB Cable', brand: 'Ambrane', price: 299, quantity: 3 },
      { name: 'Phone Case', brand: 'Spigen', price: 599, quantity: 1 },
      { name: 'Tempered Glass', brand: 'Nillkin', price: 399, quantity: 2 },
      { name: 'SanDisk Pendrive 64GB', brand: 'SanDisk', price: 799, quantity: 1 },
    ],
  });

  // ============ ONLINE SHOPPING - AMAZON (10 transactions) ============
  transactions.push({
    merchant: 'Amazon',
    merchantEmoji: '📦',
    date: getRandomDate(12),
    time: '22:30',
    amount: 1299.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'Amazon Basics HDMI Cable', brand: 'Amazon Basics', price: 399, quantity: 1 },
      { name: 'Keyboard', brand: 'Zebronics', price: 450, quantity: 1 },
      { name: 'Mouse', brand: 'Logitech', price: 450, quantity: 1 },
    ],
    notes: 'Prime delivery',
  });

  transactions.push({
    merchant: 'Amazon',
    merchantEmoji: '📦',
    date: getRandomDate(38),
    time: '19:15',
    amount: 3499.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'Philips Trimmer', brand: 'Philips', price: 1699, quantity: 1 },
      { name: 'Nivea Men Face Wash', brand: 'Nivea', price: 245, quantity: 3 },
      { name: 'Gillette Razor', brand: 'Gillette', price: 325, quantity: 2 },
    ],
  });

  transactions.push({
    merchant: 'Amazon',
    merchantEmoji: '📦',
    date: getRandomDate(55),
    time: '15:00',
    amount: 2199.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'Nike Running Shoes', brand: 'Nike', price: 2199, quantity: 1 },
    ],
  });

  // ============ FOOD & DINING (20 transactions) ============
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
    items: [
      { name: 'McAloo Tikki Burger', price: 55, quantity: 3 },
      { name: 'McSpicy Chicken', price: 185, quantity: 1 },
      { name: 'French Fries', price: 90, quantity: 2 },
    ],
  });

  transactions.push({
    merchant: 'KFC',
    merchantEmoji: '🍗',
    shopLocation: { shopName: 'KFC', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(14),
    time: '18:45',
    amount: 895.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    items: [
      { name: 'Chicken Bucket', price: 599, quantity: 1 },
      { name: 'Zinger Burger', price: 189, quantity: 1 },
      { name: 'Pepsi', price: 107, quantity: 1 },
    ],
  });

  transactions.push({
    merchant: 'Sai Krishna Tiffins',
    merchantEmoji: '☕',
    shopLocation: { shopName: 'Sai Krishna Tiffins', area: 'Governorpet', city: 'Vijayawada' },
    date: getRandomDate(9),
    time: '08:30',
    amount: 145.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    items: [
      { name: 'Idli', price: 40, quantity: 1 },
      { name: 'Vada', price: 35, quantity: 1 },
      { name: 'Dosa', price: 50, quantity: 1 },
      { name: 'Coffee', price: 20, quantity: 1 },
    ],
  });

  transactions.push({
    merchant: 'CCD',
    merchantEmoji: '☕',
    shopLocation: { shopName: 'Cafe Coffee Day', area: 'MG Road', city: 'Vijayawada' },
    date: getRandomDate(16),
    time: '16:30',
    amount: 385.00,
    currency: 'INR',
    category: Category.FOOD,
    type: 'expense',
    items: [
      { name: 'Cappuccino', price: 145, quantity: 2 },
      { name: 'Sandwich', price: 95, quantity: 1 },
    ],
  });

  // ============ TRANSPORTATION (20 transactions) ============
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

  transactions.push({
    merchant: 'Ola',
    merchantEmoji: '🚗',
    date: getRandomDate(11),
    time: '08:00',
    amount: 189.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Airport ride',
  });

  transactions.push({
    merchant: 'Ola Auto',
    merchantEmoji: '🛺',
    date: getRandomDate(13),
    time: '19:15',
    amount: 85.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
  });

  transactions.push({
    merchant: 'Nayara Petrol Pump',
    merchantEmoji: '⛽',
    shopLocation: { shopName: 'Nayara', area: 'NH16', city: 'Vijayawada' },
    date: getRandomDate(8),
    time: '17:00',
    amount: 1500.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Full tank petrol',
  });

  transactions.push({
    merchant: 'HP Petrol Pump',
    merchantEmoji: '⛽',
    shopLocation: { shopName: 'HP Petrol', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(42),
    time: '16:30',
    amount: 1200.00,
    currency: 'INR',
    category: Category.TRANSPORT,
    type: 'expense',
    notes: 'Bike refuel',
  });

  // ============ UTILITIES (8 transactions) ============
  transactions.push({
    merchant: 'APEPDCL',
    merchantEmoji: '⚡',
    date: getRandomDate(20),
    time: '15:00',
    amount: 1245.00,
    currency: 'INR',
    category: Category.UTILITIES,
    type: 'expense',
    utilityDetails: {
      type: 'electricity',
      units: 185,
      pricePerUnit: 6.73,
      propertyType: 'pg',
      propertyName: 'My PG',
    },
    notes: 'Electricity bill - December',
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
    utilityDetails: {
      type: 'internet',
    },
    notes: 'Monthly broadband',
  });

  transactions.push({
    merchant: 'Jio Mobile',
    merchantEmoji: '📱',
    date: getRandomDate(22),
    time: '11:30',
    amount: 399.00,
    currency: 'INR',
    category: Category.UTILITIES,
    type: 'expense',
    utilityDetails: {
      type: 'mobile',
    },
    notes: 'Mobile recharge - 84 days',
  });

  transactions.push({
    merchant: 'Airtel',
    merchantEmoji: '📱',
    date: getRandomDate(65),
    time: '14:00',
    amount: 479.00,
    currency: 'INR',
    category: Category.UTILITIES,
    type: 'expense',
    utilityDetails: {
      type: 'mobile',
    },
    notes: 'Mobile recharge',
  });

  // ============ ENTERTAINMENT (12 transactions) ============
  transactions.push({
    merchant: 'BookMyShow',
    merchantEmoji: '🎬',
    date: getRandomDate(4),
    time: '20:00',
    amount: 680.00,
    currency: 'INR',
    category: Category.ENTERTAINMENT,
    type: 'expense',
    items: [
      { name: 'Movie Tickets', price: 250, quantity: 2 },
      { name: 'Popcorn', price: 180, quantity: 1 },
    ],
    notes: 'PVR - Salaar movie',
  });

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

  transactions.push({
    merchant: 'Spotify',
    merchantEmoji: '🎵',
    date: getRandomDate(52),
    time: '12:00',
    amount: 119.00,
    currency: 'INR',
    category: Category.ENTERTAINMENT,
    type: 'expense',
    notes: 'Monthly music subscription',
  });

  transactions.push({
    merchant: 'Xbox Game Pass',
    merchantEmoji: '🎮',
    date: getRandomDate(60),
    time: '22:30',
    amount: 489.00,
    currency: 'INR',
    category: Category.ENTERTAINMENT,
    type: 'expense',
    notes: 'Cloud gaming subscription',
  });

  // ============ HEALTH & FITNESS (6 transactions) ============
  transactions.push({
    merchant: 'Apollo Pharmacy',
    merchantEmoji: '💊',
    shopLocation: { shopName: 'Apollo Pharmacy', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(12),
    time: '11:00',
    amount: 1245.00,
    currency: 'INR',
    category: Category.HEALTH,
    type: 'expense',
    items: [
      { name: 'Paracetamol', price: 25, quantity: 3 },
      { name: 'Vitamin D3', price: 385, quantity: 1 },
      { name: 'Omega-3 Capsules', price: 495, quantity: 1 },
      { name: 'Protein Powder', price: 340, quantity: 1 },
    ],
  });

  transactions.push({
    merchant: 'Cult.fit Gym',
    merchantEmoji: '💪',
    shopLocation: { shopName: 'Cult.fit', area: 'MG Road', city: 'Vijayawada' },
    date: getRandomDate(35),
    time: '18:00',
    amount: 2999.00,
    currency: 'INR',
    category: Category.HEALTH,
    type: 'expense',
    notes: '3-month gym membership',
  });

  // ============ EDUCATION (5 transactions) ============
  transactions.push({
    merchant: 'Udemy',
    merchantEmoji: '📚',
    date: getRandomDate(24),
    time: '21:00',
    amount: 799.00,
    currency: 'INR',
    category: Category.EDUCATION,
    type: 'expense',
    notes: 'React.js course',
  });

  transactions.push({
    merchant: 'Coursera',
    merchantEmoji: '🎓',
    date: getRandomDate(50),
    time: '19:00',
    amount: 3999.00,
    currency: 'INR',
    category: Category.EDUCATION,
    type: 'expense',
    notes: 'AI/ML Specialization',
  });

  // ============ GOVERNMENT & BANKING (4 transactions) ============
  transactions.push({
    merchant: 'SBI Bank',
    merchantEmoji: '🏦',
    date: getRandomDate(31),
    time: '10:00',
    amount: 350.00,
    currency: 'INR',
    category: Category.BANKING,
    type: 'expense',
    notes: 'Annual debit card charges',
  });

  transactions.push({
    merchant: 'HDFC Credit Card',
    merchantEmoji: '💳',
    date: getRandomDate(40),
    time: '15:00',
    amount: 12450.00,
    currency: 'INR',
    category: Category.BANKING,
    type: 'expense',
    notes: 'Credit card bill payment',
  });

  // ============ INCOME TRANSACTIONS (8 transactions) ============
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
    notes: 'Website development project',
  });

  transactions.push({
    merchant: 'Interest Income',
    merchantEmoji: '🏦',
    date: getRandomDate(45),
    time: '00:00',
    amount: 850.00,
    currency: 'INR',
    category: Category.INCOME,
    type: 'income',
    notes: 'Savings account interest',
  });

  // ============ PERSON TRANSACTIONS - MONEY LENT/BORROWED (10 transactions) ============
  transactions.push({
    merchant: 'Ramesh (Roommate)',
    merchantEmoji: '👤',
    date: getRandomDate(3),
    time: '20:00',
    amount: 2000.00,
    currency: 'INR',
    category: Category.OTHER,
    type: 'expense',
    personName: 'Ramesh',
    personType: 'colleague',
    notes: 'Lent money - will return next week',
  });

  transactions.push({
    merchant: 'Priya',
    merchantEmoji: '👤',
    date: getRandomDate(25),
    time: '18:30',
    amount: 500.00,
    currency: 'INR',
    category: Category.OTHER,
    type: 'income',
    personName: 'Priya',
    personType: 'friend',
    notes: 'Received money back',
  });

  transactions.push({
    merchant: 'Suresh (PG Owner)',
    merchantEmoji: '👤',
    date: getRandomDate(10),
    time: '09:00',
    amount: 7500.00,
    currency: 'INR',
    category: Category.OTHER,
    type: 'expense',
    personName: 'Suresh',
    personType: 'pg_owner',
    notes: 'Monthly PG rent',
  });

  transactions.push({
    merchant: 'Kumar (Friend)',
    merchantEmoji: '👤',
    date: getRandomDate(35),
    time: '21:00',
    amount: 1500.00,
    currency: 'INR',
    category: Category.OTHER,
    type: 'expense',
    personName: 'Kumar',
    personType: 'friend',
    notes: 'Dinner bill split',
  });

  transactions.push({
    merchant: 'Mother',
    merchantEmoji: '👤',
    date: getRandomDate(48),
    time: '10:00',
    amount: 5000.00,
    currency: 'INR',
    category: Category.OTHER,
    type: 'income',
    personName: 'Mother',
    personType: 'family',
    notes: 'Monthly allowance',
  });

  // ============ PERSONAL CARE (8 transactions) ============
  transactions.push({
    merchant: 'Looks Salon',
    merchantEmoji: '💇',
    shopLocation: { shopName: 'Looks Unisex Salon', area: 'Labbipet', city: 'Vijayawada' },
    date: getRandomDate(19),
    time: '15:30',
    amount: 450.00,
    currency: 'INR',
    category: Category.PERSONAL_CARE,
    type: 'expense',
    notes: 'Haircut + beard trim',
  });

  transactions.push({
    merchant: 'Reliance Trends',
    merchantEmoji: '👕',
    shopLocation: { shopName: 'Reliance Trends', area: 'Benz Circle', city: 'Vijayawada' },
    date: getRandomDate(41),
    time: '17:00',
    amount: 1899.00,
    currency: 'INR',
    category: Category.SHOPPING,
    type: 'expense',
    items: [
      { name: 'Formal Shirt', price: 899, quantity: 1 },
      { name: 'Jeans', price: 1000, quantity: 1 },
    ],
  });

  // MORE TRANSACTIONS TO REACH 100+
  // Add more quick commerce, transportation, food orders
  for (let i = 0; i < 10; i++) {
    transactions.push({
      merchant: 'Swiggy',
      merchantEmoji: '🍔',
      date: getRandomDate(Math.floor(Math.random() * 90)),
      time: getRandomTime(),
      amount: Math.floor(Math.random() * 400) + 200,
      currency: 'INR',
      category: Category.FOOD,
      type: 'expense',
      notes: `Food delivery order #${i + 1}`,
    });
  }

  for (let i = 0; i < 10; i++) {
    transactions.push({
      merchant: 'Rapido',
      merchantEmoji: '🛵',
      date: getRandomDate(Math.floor(Math.random() * 90)),
      time: getRandomTime(),
      amount: Math.floor(Math.random() * 100) + 50,
      currency: 'INR',
      category: Category.TRANSPORT,
      type: 'expense',
      notes: `Bike ride #${i + 1}`,
    });
  }

  for (let i = 0; i < 5; i++) {
    transactions.push({
      merchant: 'Chai Point',
      merchantEmoji: '☕',
      shopLocation: { shopName: 'Chai Point', area: 'Benz Circle', city: 'Vijayawada' },
      date: getRandomDate(Math.floor(Math.random() * 90)),
      time: getRandomTime(),
      amount: Math.floor(Math.random() * 150) + 80,
      currency: 'INR',
      category: Category.FOOD,
      type: 'expense',
      notes: `Tea/snacks #${i + 1}`,
    });
  }

  return transactions;
};

// Initialize seed data for new user
export const initializeSeedData = async (userId: string) => {
  try {
    // Check if already initialized
    const alreadyInitialized = await isSeedDataInitialized(userId);
    if (alreadyInitialized) {
      console.log('Seed data already initialized for this user');
      return;
    }

    // Check if user is actually first time (no transactions)
    const isFirstTime = await checkIfFirstTimeUser(userId);
    if (!isFirstTime) {
      console.log('User already has transactions');
      return;
    }

    console.log('Initializing seed data for new user...');

    // Generate and add transactions
    const seedTransactions = generateSeedData();
    await addTransactionsBatch(seedTransactions, userId);

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

    // Add sample buying list items
    const buyingItems: Omit<BuyingItem, 'id'>[] = [
      { name: 'New Headphones', estimatedPrice: 2000, currency: 'INR', isBought: false },
      { name: 'Running Shoes', estimatedPrice: 3500, currency: 'INR', isBought: false },
      { name: 'Laptop Bag', estimatedPrice: 1500, currency: 'INR', isBought: false },
      { name: 'Water Bottle', estimatedPrice: 500, currency: 'INR', isBought: false },
      { name: 'Desk Organizer', estimatedPrice: 800, currency: 'INR', isBought: false },
    ];

    for (const item of buyingItems) {
      await addBuyingItem(item, userId);
    }

    // Mark as initialized
    await markUserAsInitialized(userId);

    console.log('✅ Seed data initialized successfully!');
  } catch (error) {
    console.error('Error initializing seed data:', error);
    throw error;
  }
};

// Reset app data (for settings)
export const resetAppData = async (userId: string) => {
  try {
    // Delete all transactions
    const txSnapshot = await db.collection('transactions').where('userId', '==', userId).get();
    const txBatch = db.batch();
    txSnapshot.docs.forEach((doc) => {
      txBatch.delete(doc.ref);
    });
    await txBatch.commit();

    // Delete all wallets
    const walletSnapshot = await db.collection('wallets').where('userId', '==', userId).get();
    const walletBatch = db.batch();
    walletSnapshot.docs.forEach((doc) => {
      walletBatch.delete(doc.ref);
    });
    await walletBatch.commit();

    // Delete all buying list items
    const buyingSnapshot = await db.collection('buyingList').where('userId', '==', userId).get();
    const buyingBatch = db.batch();
    buyingSnapshot.docs.forEach((doc) => {
      buyingBatch.delete(doc.ref);
    });
    await buyingBatch.commit();

    // Delete all products
    const productSnapshot = await db.collection('products').where('userId', '==', userId).get();
    const productBatch = db.batch();
    productSnapshot.docs.forEach((doc) => {
      productBatch.delete(doc.ref);
    });
    await productBatch.commit();

    // Delete all price history
    const priceSnapshot = await db.collection('priceHistory').where('userId', '==', userId).get();
    const priceBatch = db.batch();
    priceSnapshot.docs.forEach((doc) => {
      priceBatch.delete(doc.ref);
    });
    await priceBatch.commit();

    // Delete all budgets
    const budgetSnapshot = await db.collection('budgets').where('userId', '==', userId).get();
    const budgetBatch = db.batch();
    budgetSnapshot.docs.forEach((doc) => {
      budgetBatch.delete(doc.ref);
    });
    await budgetBatch.commit();

    // Delete all recurring transactions
    const recurringSnapshot = await db.collection('recurringTransactions').where('userId', '==', userId).get();
    const recurringBatch = db.batch();
    recurringSnapshot.docs.forEach((doc) => {
      recurringBatch.delete(doc.ref);
    });
    await recurringBatch.commit();

    // Delete all merchant rules
    const rulesSnapshot = await db.collection('merchantRules').where('userId', '==', userId).get();
    const rulesBatch = db.batch();
    rulesSnapshot.docs.forEach((doc) => {
      rulesBatch.delete(doc.ref);
    });
    await rulesBatch.commit();

    // Reset user profile
    await db.collection('userProfiles').doc(userId).set({ 
      seedDataInitialized: false,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });

    console.log('✅ App data reset successfully!');
  } catch (error) {
    console.error('Error resetting app data:', error);
    throw error;
  }
};
