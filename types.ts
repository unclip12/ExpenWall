export enum Category {
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health & Fitness',
  GROCERIES = 'Groceries',
  OTHER = 'Other'
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
  items?: TransactionItem[];
  notes?: string;
  receiptUrl?: string; // Base64 of receipt if uploaded
}

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  currency?: string;
  category: string;
  items: TransactionItem[];
}