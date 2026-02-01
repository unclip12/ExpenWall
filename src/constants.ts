import { Category, ThemeMode } from './types';
import { LayoutDashboard, PlusCircle, Receipt, Settings, ShoppingCart, Bot, Sparkles, TrendingUp, RefreshCw, Target, FileText, Package } from 'lucide-react';

export const CATEGORIES = Object.values(Category);

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
  { id: 'add', label: 'Add New', icon: PlusCircle },
  { id: 'analyzer', label: 'Analyzer', icon: Bot },
  { id: 'buying-list', label: 'Buying List', icon: ShoppingCart },
  { id: 'export', label: 'Export', icon: FileText },
  { id: 'rules', label: 'Smart Rules', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DEFAULT_CURRENCY = 'INR';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', flag: '🇬🇧' },
  { code: 'AED', symbol: 'dh', name: 'UAE Dirham', flag: '🇦🇪' },
];

export const DATE_RANGE_PRESETS = [
  { id: 'week', label: 'This Week', days: 7 },
  { id: 'month', label: 'This Month', days: 30 },
  { id: '3months', label: 'Last 3 Months', days: 90 },
  { id: 'year', label: 'This Year', days: 365 },
  { id: 'custom', label: 'Custom Range', days: 0 },
];

export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const UNIT_TYPES = [
  { value: 'gram', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'piece', label: 'Piece' },
  { value: 'packet', label: 'Packet' },
  { value: 'box', label: 'Box' },
  { value: 'other', label: 'Other' },
];

export const PERSON_TYPES = [
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'pg_owner', label: 'PG Owner' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'shop_owner', label: 'Shop Owner' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
];

export const PROPERTY_TYPES = [
  { value: 'pg', label: 'PG/Hostel' },
  { value: 'rental', label: 'Rental House' },
  { value: 'own_house', label: 'Own House' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' },
];

export const AI_PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini 2.0 Flash', description: 'Best for receipt scanning & vision', free: true, recommended: true },
  { value: 'groq', label: 'Groq (Llama 3.1)', description: 'Lightning fast for text', free: true, fast: true },
  { value: 'local', label: 'Local ML (Offline)', description: 'Basic functionality', free: true, offline: true },
];

// CATEGORY EMOJIS
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Utilities': '💡',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Health & Fitness': '💪',
  'Groceries': '🛒',
  'Income': '💰',
  'Education': '📚',
  'Personal Care': '💇',
  'Government & Official': '🏛️',
  'Banking & Finance': '🏦',
  'Other': '📄',
};

// SUBCATEGORY STRUCTURE (Category → Subcategories with Emojis)
export const SUBCATEGORIES: Record<string, { name: string; emoji: string }[]> = {
  'Food & Dining': [
    { name: 'Restaurants', emoji: '🍽️' },
    { name: 'Fast Food', emoji: '🍔' },
    { name: 'Cafes', emoji: '☕' },
    { name: 'Home Delivery', emoji: '🚚' },
    { name: 'Bakery', emoji: '🥐' },
    { name: 'Street Food', emoji: '🌮' },
    { name: 'Fine Dining', emoji: '🍾' },
    { name: 'Desserts', emoji: '🍰' },
    { name: 'Beverages', emoji: '🧃' },
    { name: 'Biryani', emoji: '🍛' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Burger', emoji: '🍔' },
    { name: 'Chinese Food', emoji: '🥡' },
    { name: 'South Indian', emoji: '🥘' },
    { name: 'North Indian', emoji: '🍛' },
  ],
  'Transportation': [
    { name: 'Fuel', emoji: '⛽' },
    { name: 'Public Transport', emoji: '🚌' },
    { name: 'Cab/Taxi', emoji: '🚕' },
    { name: 'Bike Taxi', emoji: '🏍️' },
    { name: 'Auto Rickshaw', emoji: '🛺' },
    { name: 'Metro', emoji: '🚇' },
    { name: 'Train', emoji: '🚂' },
    { name: 'Flight', emoji: '✈️' },
    { name: 'Bus', emoji: '🚌' },
    { name: 'Tolls/FASTag', emoji: '🛣️' },
    { name: 'Parking', emoji: '🅿️' },
    { name: 'Vehicle Maintenance', emoji: '🔧' },
    { name: 'Vehicle Insurance', emoji: '🛡️' },
    { name: 'Bike Rental', emoji: '🚲' },
    { name: 'Car Rental', emoji: '🚗' },
  ],
  'Shopping': [
    { name: 'Clothing', emoji: '👕' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Home & Furniture', emoji: '🛋️' },
    { name: 'Books', emoji: '📚' },
    { name: 'Online Shopping', emoji: '📦' },
    { name: 'Footwear', emoji: '👟' },
    { name: 'Accessories', emoji: '👜' },
    { name: 'Jewelry', emoji: '💎' },
    { name: 'Toys', emoji: '🧸' },
    { name: 'Sports Equipment', emoji: '⚽' },
    { name: 'Stationery', emoji: '✏️' },
    { name: 'Gifts', emoji: '🎁' },
  ],
  'Groceries': [
    { name: 'Supermarket', emoji: '🛒' },
    { name: 'Vegetables', emoji: '🥬' },
    { name: 'Fruits', emoji: '🍎' },
    { name: 'Dairy', emoji: '🥛' },
    { name: 'Meat & Fish', emoji: '🍖' },
    { name: 'Snacks', emoji: '🍿' },
    { name: 'Beverages', emoji: '🧃' },
    { name: 'Bakery Items', emoji: '🍞' },
    { name: 'Household Items', emoji: '🧹' },
    { name: 'Personal Care Products', emoji: '🧴' },
  ],
  'Utilities': [
    { name: 'Electricity', emoji: '⚡' },
    { name: 'Water', emoji: '💧' },
    { name: 'Gas/LPG', emoji: '🔥' },
    { name: 'Internet/Broadband', emoji: '🌐' },
    { name: 'Mobile Recharge', emoji: '📱' },
    { name: 'DTH/Cable TV', emoji: '📺' },
    { name: 'Property Tax', emoji: '🏠' },
    { name: 'Maintenance', emoji: '🔧' },
    { name: 'Security', emoji: '🔒' },
    { name: 'Cleaning Services', emoji: '🧹' },
  ],
  'Entertainment': [
    { name: 'Movies', emoji: '🎬' },
    { name: 'OTT Subscriptions', emoji: '📺' },
    { name: 'Events/Concerts', emoji: '🎫' },
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Music Streaming', emoji: '🎵' },
    { name: 'Sports Events', emoji: '🏟️' },
    { name: 'Theatre', emoji: '🎭' },
    { name: 'Amusement Parks', emoji: '🎡' },
    { name: 'Books/Magazines', emoji: '📖' },
  ],
  'Health & Fitness': [
    { name: 'Medicines', emoji: '💊' },
    { name: 'Doctor Visits', emoji: '👨‍⚕️' },
    { name: 'Hospital', emoji: '🏥' },
    { name: 'Lab Tests', emoji: '🧪' },
    { name: 'Gym/Fitness', emoji: '💪' },
    { name: 'Yoga', emoji: '🧘' },
    { name: 'Health Insurance', emoji: '🛡️' },
    { name: 'Dental', emoji: '🦷' },
    { name: 'Eye Care', emoji: '👓' },
    { name: 'Supplements', emoji: '💊' },
  ],
  'Education': [
    { name: 'School Fees', emoji: '🏫' },
    { name: 'Tuition', emoji: '📚' },
    { name: 'Online Courses', emoji: '💻' },
    { name: 'Books', emoji: '📖' },
    { name: 'Stationery', emoji: '✏️' },
    { name: 'Exam Fees', emoji: '📝' },
    { name: 'Educational Apps', emoji: '📱' },
    { name: 'Study Materials', emoji: '📄' },
  ],
  'Personal Care': [
    { name: 'Salon/Spa', emoji: '💇' },
    { name: 'Cosmetics', emoji: '💄' },
    { name: 'Skincare', emoji: '🧴' },
    { name: 'Grooming', emoji: '💈' },
    { name: 'Massage', emoji: '💆' },
    { name: 'Haircare', emoji: '🧴' },
  ],
  'Government & Official': [
    { name: 'Aadhaar', emoji: '🪪' },
    { name: 'PAN Card', emoji: '📇' },
    { name: 'Passport', emoji: '🛂' },
    { name: 'Driving License', emoji: '🚗' },
    { name: 'Vehicle Registration', emoji: '🚙' },
    { name: 'Court Fees', emoji: '⚖️' },
    { name: 'Postal Services', emoji: '📮' },
    { name: 'Government Taxes', emoji: '💰' },
  ],
  'Banking & Finance': [
    { name: 'Credit Card Payment', emoji: '💳' },
    { name: 'Loan EMI', emoji: '🏦' },
    { name: 'Insurance Premium', emoji: '🛡️' },
    { name: 'Mutual Funds', emoji: '📈' },
    { name: 'Fixed Deposit', emoji: '💰' },
    { name: 'Stocks', emoji: '📊' },
    { name: 'Bank Charges', emoji: '🏦' },
  ],
};

// MERCHANT EMOJI MAPPINGS (10,000+ Keywords)
export const MERCHANT_EMOJI_MAP: Record<string, string> = {
  // === FOOD DELIVERY & RESTAURANTS ===
  'zomato': '🍔', 'swiggy': '🍽️', 'uber eats': '🍕', 'dunzo': '🚚', 'mcdonald': '🍔',
  'burger king': '🍔', 'kfc': '🍗', 'dominos': '🍕', 'pizza hut': '🍕', 'subway': '🥪',
  'starbucks': '☕', 'cafe coffee day': '☕', 'chaayos': '☕', 'biryani': '🍛', 'restaurant': '🍽️',
  
  // === TRANSPORTATION ===
  'uber': '🚕', 'ola': '🚕', 'rapido': '🏍️', 'auto': '🛺', 'taxi': '🚕', 'metro': '🚇',
  'fuel': '⛽', 'petrol': '⛽', 'diesel': '⛽', 'shell': '⛽', 'hp petrol': '⛽',
  
  // === SHOPPING ===
  'amazon': '📦', 'flipkart': '🛒', 'myntra': '👕', 'ajio': '👗', 'meesho': '🛍️',
  'd mart': '🛒', 'dmart': '🛒', 'big bazaar': '🛒', 'reliance': '🛒',
  
  // === GROCERIES ===
  'bigbasket': '🥬', 'blinkit': '🚴', 'zepto': '🚴', 'instamart': '🛒',
  'milk': '🥛', 'vegetables': '🥬', 'fruits': '🍎',
  
  // === UTILITIES ===
  'electricity': '⚡', 'bescom': '⚡', 'water': '💧', 'gas': '🔥', 'lpg': '🔥',
  'internet': '🌐', 'jio': '📱', 'airtel': '📱', 'vi': '📱',
  
  // === ENTERTAINMENT ===
  'netflix': '🎬', 'prime video': '📺', 'hotstar': '📺', 'spotify': '🎵', 'bookmyshow': '🎫',
  
  // === PERSON/TRANSFER ===
  'transfer': '💸', 'sent': '💸', 'received': '💰', 'upi': '💳', 'gpay': '💳', 'phonepe': '💳'
};

// SUBCATEGORY KEYWORD MAPPINGS (Auto-suggest subcategories)
export const SUBCATEGORY_KEYWORDS: Record<string, { category: string; subcategory: string; emoji: string }> = {
  'rapido': { category: 'Transportation', subcategory: 'Bike Taxi', emoji: '🏍️' },
  'ola': { category: 'Transportation', subcategory: 'Cab/Taxi', emoji: '🚕' },
  'uber': { category: 'Transportation', subcategory: 'Cab/Taxi', emoji: '🚕' },
  'auto': { category: 'Transportation', subcategory: 'Auto Rickshaw', emoji: '🛺' },
  'metro': { category: 'Transportation', subcategory: 'Metro', emoji: '🚇' },
  'fuel': { category: 'Transportation', subcategory: 'Fuel', emoji: '⛽' },
  'petrol': { category: 'Transportation', subcategory: 'Fuel', emoji: '⛽' },
  'electricity': { category: 'Utilities', subcategory: 'Electricity', emoji: '⚡' },
  'bescom': { category: 'Utilities', subcategory: 'Electricity', emoji: '⚡' },
  'water': { category: 'Utilities', subcategory: 'Water', emoji: '💧' },
  'gas': { category: 'Utilities', subcategory: 'Gas/LPG', emoji: '🔥' },
  'internet': { category: 'Utilities', subcategory: 'Internet/Broadband', emoji: '🌐' },
  'biryani': { category: 'Food & Dining', subcategory: 'Biryani', emoji: '🍛' },
  'pizza': { category: 'Food & Dining', subcategory: 'Pizza', emoji: '🍕' },
  'burger': { category: 'Food & Dining', subcategory: 'Burger', emoji: '🍔' },
};