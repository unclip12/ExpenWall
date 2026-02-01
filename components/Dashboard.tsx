import React from 'react';
import { Transaction, Category, MerchantRule, Budget } from '../types';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { useProcessedTransactions } from '../hooks';
import { InsightsPanel } from './InsightsPanel';

interface DashboardProps {
  transactions: Transaction[];
  rules: MerchantRule[];
  budgets: Budget[];
}

const CATEGORY_ICONS: Record<string, string> = {
  [Category.FOOD]: '🍔',
  [Category.TRANSPORT]: '🚗',
  [Category.SHOPPING]: '🛍️',
  [Category.ENTERTAINMENT]: '🎬',
  [Category.HEALTH]: '💪',
  [Category.GROCERIES]: '🛒',
  [Category.UTILITIES]: '💡',
  [Category.OTHER]: '📄',
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, rules, budgets }) => {
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currentSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';
  const processedTransactions = useProcessedTransactions(transactions, rules);

  const totalSpent = processedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = processedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalSpent;

  const recentTransactions = [...processedTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const categoryData = Object.values(Category)
    .filter(cat => cat !== Category.INCOME)
    .map(cat => ({
      name: cat,
      value: processedTransactions
        .filter(t => t.type === 'expense' && t.displayCategory === cat)
        .reduce((sum, t) => sum + t.amount, 0)
    }))
    .filter(item => item.value > 0);

  // Trend data (last 7 days)
  const trendData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayExpenses = processedTransactions
        .filter(t => t.type === 'expense' && t.date === date)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: date.slice(5), // MM-DD
        expense: dayExpenses,
      };
    });
  }, [processedTransactions]);

  // Budget warnings
  const budgetWarnings = React.useMemo(() => {
    const warnings: { category: string; percentage: number }[] = [];
    
    budgets.forEach(budget => {
      const spent = processedTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = (spent / budget.amount) * 100;
      if (percentage >= 80) {
        warnings.push({ category: budget.category, percentage });
      }
    });

    return warnings;
  }, [budgets, processedTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Budget Warnings */}
      {budgetWarnings.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="font-bold text-orange-800 dark:text-orange-300">Budget Alerts</span>
          </div>
          <div className="space-y-1">
            {budgetWarnings.map(w => (
              <p key={w.category} className="text-sm text-orange-700 dark:text-orange-300">
                • {w.category}: {w.percentage.toFixed(0)}% of budget used
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/20 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-2xl">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Income</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{currentSymbol}{totalIncome.toFixed(2)}</h3>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/20 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100/50 dark:bg-red-900/30 rounded-2xl">
              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expense</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{currentSymbol}{totalSpent.toFixed(2)}</h3>
        </div>

        <div className="bg-gradient-to-br from-indigo-600/90 to-violet-600/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl text-white border border-white/10 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className="text-4xl font-bold relative z-10">{currentSymbol}{netBalance.toFixed(2)}</h3>
        </div>
      </div>

      {/* AI Insights */}
      <InsightsPanel transactions={transactions} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Analysis */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${currentSymbol}${value.toFixed(2)}`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.5)',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center px-3 py-1 bg-white/50 dark:bg-slate-700/50 rounded-full border border-white/40 dark:border-slate-600/40">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-slate-400 dark:text-slate-500">
              <p>No expenses recorded yet.</p>
            </div>
          )}
        </div>

        {/* 7-Day Trend */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">7-Day Spending Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => `${currentSymbol}${value.toFixed(2)}`}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Line type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/20">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? recentTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-700/40 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-2xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                  t.type === 'income' ? 'bg-emerald-100/80 dark:bg-emerald-900/30' : 'bg-indigo-50/80 dark:bg-indigo-900/30'
                }`}>
                  {t.type === 'income' ? '💰' : (CATEGORY_ICONS[t.displayCategory] || '📄')}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[120px]">
                    {t.displayMerchant}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}{currentSymbol}{t.amount.toFixed(2)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.displayCategory}</p>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              No recent activity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};