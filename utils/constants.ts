import { LayoutDashboard, CreditCard, TrendingUp, ShoppingCart, Settings, FileText, RefreshCw, PiggyBank, DollarSign, Sparkles, Cookie } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: CreditCard, label: 'Transactions', path: 'transactions' },
  { icon: TrendingUp, label: 'Analytics', path: 'analytics' },
  { icon: ShoppingCart, label: 'Buying List', path: 'buying-list' },
  { icon: Cookie, label: 'Cravings', path: 'cravings' },
  { icon: RefreshCw, label: 'Recurring', path: 'recurring' },
  { icon: PiggyBank, label: 'Budgets', path: 'budgets' },
  { icon: DollarSign, label: 'Split Bills', path: 'split-bills' },
  { icon: FileText, label: 'Reports', path: 'reports' },
  { icon: Sparkles, label: 'AI Analyzer', path: 'analyzer' },
  { icon: Settings, label: 'Settings', path: 'settings' }
];

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health & Fitness',
  'Groceries',
  'Income',
  'Education',
  'Personal Care',
  'Government & Official',
  'Banking & Finance',
  'Other'
];

export const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const DATE_PRESETS = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' }
];

export const WALLET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316'  // orange
];