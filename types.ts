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

export type WalletType = 'bank' | 'cash' | 'credit' | 'digital';

export interface Wallet {
  id: string;
  userId?: string;
  name: string;
  type: WalletType;
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
  currency: string;
  category: Category;
  type: TransactionType;
  walletId?: string;
  items?: TransactionItem[];
  notes?: string;
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
  type: TransactionType;
  category: string;
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
  createdAt?: any;
}

// Processed types for display (after applying rules)
export interface ProcessedTransaction extends Transaction {
  displayMerchant: string;
  displayCategory: Category;
  isAliased: boolean;
}