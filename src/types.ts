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
  OTHER = 'Other'
}

export type TransactionType = 'expense' | 'income';
export type WalletType = 'bank' | 'cash' | 'credit' | 'digital';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'system';
export type PersonType = 'friend' | 'family' | 'pg_owner' | 'landlord' | 'shop_owner' | 'colleague' | 'other';
export type PropertyType = 'pg' | 'rental' | 'own_house' | 'office' | 'other';
export type UnitType = 'gram' | 'kg' | 'ml' | 'litre' | 'piece' | 'packet' | 'box' | 'other';

export interface Wallet {
  id: string;
  userId?: string;
  name: string;
  type: WalletType;
  color?: string;
  createdAt?: any;
}

export interface ShopLocation {
  shopName: string;
  area?: string;
  city?: string;
  lastVisited?: string;
  avgPrice?: number;
}

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  propertyName?: string;
  totalReceived: number;
  totalSent: number;
  balance: number;
  transactions?: Transaction[];
}

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
  type?: 'electricity' | 'water' | 'gas' | 'internet' | 'mobile' | 'dth';
  units?: number;
  pricePerUnit?: number;
  propertyType?: PropertyType;
  propertyName?: string;
  meterNumber?: string;
}

export interface SplitPerson {
  id: string;
  name: string;
  amount: number;
  isPaid: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  merchant: string;
  merchantEmoji?: string;
  shopLocation?: ShopLocation;
  date: string;
  time?: string;
  amount: number;
  currency: string;
  category: Category;
  subcategory?: string;
  type: TransactionType;
  walletId?: string;
  items?: TransactionItem[];
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringId?: string;
  personId?: string;
  personName?: string;
  personType?: PersonType;
  utilityDetails?: UtilityDetails;
  splitBill?: {
    people: SplitPerson[];
    totalPeople: number;
  };
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  currency: string;
  category: Category;
  subcategory?: string;
  type: TransactionType;
  walletId?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastGenerated?: string;
  isActive: boolean;
  nextDueDate: string;
  tags?: string[];
  notes?: string;
  createdAt?: any;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  subcategory?: string;
  amount: number;
  period: 'weekly' | 'monthly';
  startDate: string;
  alertAt80: boolean;
  alertAt100: boolean;
  createdAt?: any;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface BuyingItem {
  id: string;
  userId?: string;
  name: string;
  estimatedPrice: number;
  currency: string;
  isBought: boolean;
  createdAt?: any;
}

export interface Product {
  id: string;
  name: string;
  emoji?: string;
  brand?: string;
  category: Category;
  subcategory?: string;
  avgPrice: number;
  lowestPrice: number;
  highestPrice: number;
  totalPurchases: number;
  lastPurchased: string;
  shops: {
    shopName: string;
    area?: string;
    avgPrice: number;
    lastPrice: number;
    lastPurchased: string;
  }[];
}

export interface PriceHistory {
  id?: string;
  productName: string;
  brand?: string;
  weight?: number;
  weightUnit?: UnitType;
  price: number;
  mrp?: number;
  shopName: string;
  area?: string;
  date: string;
  transactionId: string;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  currency?: string;
  category: string;
  subcategory?: string;
  items: TransactionItem[];
  tax?: {
    cgst?: number;
    sgst?: number;
    total?: number;
  };
}

export interface StatementData {
  transactions: {
    merchant: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: string;
    subcategory?: string;
  }[];
}

export interface UserProfile {
  apiKey?: string;
  geminiApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
  aiProvider?: 'gemini' | 'groq' | 'local';
  receiptScanAI?: 'gemini' | 'groq' | 'openai';
  emojiDetectionAI?: 'gemini' | 'groq' | 'local';
  categoryDetectionAI?: 'gemini' | 'groq' | 'local';
  insightsAI?: 'gemini' | 'groq';
  theme?: ThemeMode;
  preferredCity?: string;
  updatedAt?: any;
}

export interface DraftTransaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
}

export interface AnalyzerState {
  messages: AnalyzerMessage[];
  drafts: DraftTransaction[];
  isProcessing: boolean;
}

export interface AnalyzerMessage {
  role: 'user' | 'bot';
  text: string;
}

export interface MerchantRule {
  id: string;
  userId?: string;
  originalName: string;
  renamedTo: string;
  forcedCategory?: Category;
  forcedSubcategory?: string;
  emoji?: string;
  createdAt?: any;
}

export interface ProcessedTransaction extends Transaction {
  displayMerchant: string;
  displayCategory: Category;
  displaySubcategory?: string;
  displayEmoji?: string;
  isAliased: boolean;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'suggestion' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category?: Category;
  amount?: number;
  actionable?: boolean;
  createdAt: Date;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateFrom: string;
  dateTo: string;
  categories?: Category[];
  types?: TransactionType[];
  includeCharts?: boolean;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
  preset?: 'week' | 'month' | '3months' | 'year' | 'custom';
}

export interface SubcategorySuggestion {
  subcategory: string;
  category: Category;
  emoji: string;
  confidence: number;
}