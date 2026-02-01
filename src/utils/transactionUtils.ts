import { Transaction, ProcessedTransaction, MerchantRule, Category, SubcategorySuggestion, TransactionItem } from '../types';
import { MERCHANT_EMOJI_MAP, CATEGORY_EMOJIS, SUBCATEGORY_KEYWORDS } from '../constants';

export const getMerchantEmoji = (merchant: string): string => {
  const cleanMerchant = merchant.toLowerCase().trim();
  // Try exact match first
  if (MERCHANT_EMOJI_MAP[cleanMerchant]) return MERCHANT_EMOJI_MAP[cleanMerchant];
  
  // Try partial match
  for (const [key, emoji] of Object.entries(MERCHANT_EMOJI_MAP)) {
    if (cleanMerchant.includes(key)) return emoji;
  }
  return '📄';
};

export const getCategoryEmoji = (category: Category | string): string => {
  return CATEGORY_EMOJIS[category as string] || '📄';
};

export const getSubcategoryEmoji = (subcategory: string): string => {
  const cleanSub = subcategory.toLowerCase().trim();
  for (const [key, value] of Object.entries(SUBCATEGORY_KEYWORDS)) {
    if (cleanSub.includes(key) || key.includes(cleanSub)) {
      return value.emoji;
    }
  }
  return '📄';
};

export const processTransaction = (
  tx: Transaction, 
  rules: MerchantRule[]
): ProcessedTransaction => {
  let displayMerchant = tx.merchant;
  let forcedCategory: Category | null = null;
  let forcedSubcategory: string | null = null;
  let displayEmoji = getMerchantEmoji(tx.merchant);

  // Apply merchant rules
  const rule = rules.find(r => 
    tx.merchant.toLowerCase().includes(r.originalName.toLowerCase()) ||
    r.originalName.toLowerCase().includes(tx.merchant.toLowerCase())
  );

  if (rule) {
    displayMerchant = rule.renamedTo;
    forcedCategory = rule.forcedCategory as Category || null;
    forcedSubcategory = rule.forcedSubcategory || null;
    displayEmoji = rule.emoji || displayEmoji;
  }

  return {
    ...tx,
    displayMerchant,
    displayCategory: forcedCategory || tx.category,
    displaySubcategory: forcedSubcategory || tx.subcategory || '',
    displayEmoji,
    isAliased: !!rule,
  };
};

export const getSubcategorySuggestions = (input: string): SubcategorySuggestion[] => {
  const cleanInput = input.toLowerCase().trim();
  const suggestions: SubcategorySuggestion[] = [];

  // Match against SUBCATEGORY_KEYWORDS
  for (const [keyword, mapping] of Object.entries(SUBCATEGORY_KEYWORDS)) {
    if (cleanInput.includes(keyword) || keyword.includes(cleanInput)) {
      suggestions.push({
        subcategory: mapping.subcategory,
        category: mapping.category as Category,
        emoji: mapping.emoji,
        confidence: 0.9
      });
    }
  }

  // Sort by confidence and limit to top 5
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getItemDisplayName = (items?: TransactionItem[]): string => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0].name;
  return `${items[0].name} +${items.length - 1} more items`;
};