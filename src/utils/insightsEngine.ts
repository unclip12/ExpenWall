import { Transaction, Category, AIInsight } from '../types';

/**
 * Generate local insights without AI (fallback)
 */
export const generateLocalInsights = (transactions: Transaction[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = new Date();
  const last30Days = transactions.filter(t => {
    const txDate = new Date(t.date);
    const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  // Pattern: Top spending category
  const categoryTotals: Record<string, number> = {};
  last30Days.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push({
      id: 'pattern-1',
      type: 'pattern',
      title: 'Top Spending Category',
      description: `${topCategory[0]} accounts for most of your expenses (₹${topCategory[1].toFixed(2)})`,
      priority: 'medium',
      category: topCategory[0] as Category,
      amount: topCategory[1],
      actionable: false,
      createdAt: new Date(),
    });
  }

  // Anomaly: Large transactions
  const avgAmount = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / last30Days.length || 0;
  const largeTransactions = last30Days.filter(t => t.type === 'expense' && t.amount > avgAmount * 3);
  
  if (largeTransactions.length > 0) {
    const largest = largeTransactions.sort((a, b) => b.amount - a.amount)[0];
    insights.push({
      id: 'anomaly-1',
      type: 'anomaly',
      title: 'Unusual Large Expense',
      description: `${largest.merchant} - ₹${largest.amount.toFixed(2)} is 3x above your average`,
      priority: 'high',
      category: largest.category,
      amount: largest.amount,
      actionable: false,
      createdAt: new Date(),
    });
  }

  // Suggestion: Reduce top category
  if (topCategory && topCategory[1] > 5000) {
    insights.push({
      id: 'suggestion-1',
      type: 'suggestion',
      title: 'Savings Opportunity',
      description: `Try reducing ${topCategory[0]} by 15% to save ₹${(topCategory[1] * 0.15).toFixed(2)}/month`,
      priority: 'medium',
      category: topCategory[0] as Category,
      actionable: true,
      createdAt: new Date(),
    });
  }

  return insights;
};

/**
 * Calculate date-based patterns
 */
export const getWeekendSpending = (transactions: Transaction[]): { weekend: number; weekday: number } => {
  let weekendTotal = 0;
  let weekdayTotal = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    const date = new Date(t.date);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendTotal += t.amount;
    } else {
      weekdayTotal += t.amount;
    }
  });

  return { weekend: weekendTotal, weekday: weekdayTotal };
};