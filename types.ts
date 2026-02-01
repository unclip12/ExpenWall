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
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ThemeMode = 'light' | 'dark' | 'system';

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
  date: string;
  amount: number;
  currency: string;
  category: Category;
  type: TransactionType;
  walletId?: string;
  items?: TransactionItem[];
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringId?: string;
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
  theme?: ThemeMode;
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

export interface ProcessedTransaction extends Transaction {
  displayMerchant: string;
  displayCategory: Category;
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