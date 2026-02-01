import { useMemo } from 'react';
import { Transaction, MerchantRule, ProcessedTransaction, Category } from './types';

/**
 * Applies merchant rules to a list of transactions, producing display-ready data.
 * Memoised so it only recalculates when transactions or rules change.
 */
export const useProcessedTransactions = (
  transactions: Transaction[],
  rules: MerchantRule[]
): ProcessedTransaction[] => {
  return useMemo(() => {
    // Build a lowercase lookup map for O(1) rule matching
    const ruleMap = new Map<string, MerchantRule>();
    rules.forEach(r => ruleMap.set(r.originalName.toLowerCase(), r));

    return transactions.map(t => {
      const rule = ruleMap.get(t.merchant.toLowerCase());
      return {
        ...t,
        displayMerchant: rule?.renamedTo ?? t.merchant,
        displayCategory: (rule?.forcedCategory ?? t.category) as Category,
        displaySubcategory: rule?.forcedSubcategory || t.subcategory || '',
        displayEmoji: rule?.emoji || t.merchantEmoji || '📄',
        isAliased: !!rule
      };
    });
  }, [transactions, rules]);
};