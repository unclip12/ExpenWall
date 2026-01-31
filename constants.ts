import { Category } from './types';
import { LayoutDashboard, PlusCircle, Receipt, Settings, ShoppingCart, Bot, Sparkles } from 'lucide-react';

export const CATEGORIES = Object.values(Category);

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'add', label: 'Add New', icon: PlusCircle },
  { id: 'analyzer', label: 'Analyzer', icon: Bot },
  { id: 'buying-list', label: 'Buying List', icon: ShoppingCart },
  { id: 'rules', label: 'Smart Rules', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DEFAULT_CURRENCY = 'INR';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'AED', symbol: 'dh', name: 'United Arab Emirates Dirham', flag: '🇦🇪' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', flag: '🇦🇷' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', flag: '🇨🇱' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', flag: '🇨🇴' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', flag: '🇬🇧' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', flag: '🇮🇱' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', flag: '🇹🇼' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng', flag: '🇻🇳' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' }
];