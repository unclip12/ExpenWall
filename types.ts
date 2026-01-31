export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health & Fitness',
  GROCERIES = 'Groceries',
  INCOME = 'Income',
  OTHER = 'Other'
}

export type TransactionType = 'expense' | 'income';

export interface Wallet {
  id: string;
  userId?: string;
  name: string; // e.g. "HDFC Bank", "Cash", "Amex"
  type: 'bank' | 'cash' | 'credit' | 'digital';
  color?: string;
  createdAt?: any;
}

export interface TransactionItem {
  name: string;
  price: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  merchant: string;
  date: string; // ISO Date string YYYY-MM-DD
  amount: number;
  currency: string; // 'USD' | 'INR'
  category: Category;
  type: TransactionType;
  walletId?: string; // Link to Wallet
  items?: TransactionItem[];
  notes?: string;
  receiptUrl?: string; // Base64 of receipt if uploaded
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

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  currency?: string;
  category: string;
  items: TransactionItem[];
}

export interface StatementData {
  transactions: {
    merchant: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: string;
  }[];
}

export interface UserProfile {
  apiKey?: string;
  updatedAt?: any;
}

export interface DraftTransaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
}

export interface AnalyzerState {
  messages: { role: 'user' | 'bot'; text: string }[];
  drafts: DraftTransaction[];
  isProcessing: boolean;
}

export interface MerchantRule {
  id: string;
  userId?: string;
  originalName: string; // e.g. "Lashmi M"
  renamedTo: string;    // e.g. "Manasa"
  forcedCategory?: Category; // e.g. "Transportation"
  createdAt?: any;
}