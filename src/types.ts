export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health & Fitness',
  GROCERIES = 'Groceries',
  INCOME = 'Income',
  EDUCATION = 'Education',
  PERSONAL_CARE = 'Personal Care',
  GOVERNMENT = 'Government & Official',
  BANKING = 'Banking & Finance',
  OTHER = 'Other',
}

export type TransactionType = 'expense' | 'income';
export type WalletType = 'bank' | 'cash' | 'credit' | 'digital';
export type UnitType = 'gram' | 'kg' | 'ml' | 'litre' | 'piece' | 'packet' | 'box' | 'other';
export type PersonType = 'friend' | 'family' | 'pg_owner' | 'landlord' | 'shop_owner' | 'colleague' | 'other';
export type PropertyType = 'pg' | 'rental' | 'own_house' | 'office' | 'other';

export interface TransactionItem {
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  weight?: number;
  weightUnit?: UnitType;
  mrp?: number;
  discount?: number;
  tax?: number;
  pricePerUnit?: number;
}

export interface UtilityDetails {
  type?: 'electricity' | 'water' | 'gas';
  units?: number;
  pricePerUnit?: number;
  propertyName?: string;
  propertyType?: PropertyType;
}

export interface ShopLocation {
  shopName: string;
  area?: string;
  city?: string;
  lastVisited?: string;
  avgPrice?: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  subcategory?: string;
  type: TransactionType;
  date: string;
  time?: string;
  notes?: string;
  currency?: string;
  walletId?: string;
  items?: TransactionItem[];
  utilityDetails?: UtilityDetails;
  shopLocation?: ShopLocation;
  personType?: PersonType;
  userId?: string;
}

export interface ProcessedTransaction extends Transaction {
  displayMerchant: string;
  displayCategory: Category;
  displaySubcategory: string;
  displayEmoji: string;
  isAliased: boolean;
}

export interface MerchantRule {
  id: string;
  originalName: string;
  renamedTo: string;
  forcedCategory?: Category;
  forcedSubcategory?: string;
  emoji?: string;
  userId: string;
}

export interface BuyingItem {
  id: string;
  name: string;
  category: Category;
  estimatedPrice?: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  purchased: boolean;
  userId: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance?: number;
  userId: string;
}

export interface RecurringTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  userId: string;
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent?: number;
  userId: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: Category;
  subcategory?: string;
  emoji?: string;
  avgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  lastPurchased: string;
  totalPurchases: number;
  shops: Array<{
    shopName: string;
    area?: string;
    avgPrice: number;
    lastPrice: number;
    lastPurchased: string;
  }>;
  userId: string;
}

export interface PriceHistory {
  id: string;
  productName: string;
  brand?: string;
  shopName: string;
  area?: string;
  price: number;
  weight?: number;
  weightUnit?: UnitType;
  mrp?: number;
  discount?: number;
  date: string;
  transactionId: string;
  userId: string;
}

export interface UserProfile {
  userId: string;
  apiKey?: string;
  geminiApiKey?: string;
  groqApiKey?: string;
  aiProvider?: 'gemini' | 'groq' | 'local';
  theme?: string;
  currency?: string;
  updatedAt: Date;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
  preset: 'week' | 'month' | 'year' | 'custom';
}

export interface SubcategorySuggestion {
  subcategory: string;
  category: string;
  emoji: string;
  confidence: number;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  category: Category;
  subcategory?: string;
  items: TransactionItem[];
  tax?: {
    cgst: number;
    sgst: number;
    total: number;
  };
}

export interface StatementData {
  transactions: Array<{
    merchant: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: Category;
    subcategory?: string;
  }>;
}

export interface AnalyzerState {
  messages: Array<{ role: 'bot' | 'user'; text: string }>;
  drafts: any[];
  isProcessing: boolean;
}

export interface DraftTransaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  subcategory?: string;
}