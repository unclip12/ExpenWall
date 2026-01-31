import React from 'react';
import { Transaction, Category, MerchantRule } from '../types';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { useProcessedTransactions } from '../hooks';

interface DashboardProps {
  transactions: Transaction[];
  rules: MerchantRule[];
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

export const Dashboard: React.FC<DashboardProps> = ({ transactions, rules }) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100/50 rounded-2xl">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{currentSymbol}{totalIncome.toFixed(2)}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 transition-transform hover:-translate-y-1 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100/50 rounded-2xl">
              <ArrowUpRight className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{currentSymbol}{totalSpent.toFixed(2)}</h3>
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

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Spending Analysis</h3>
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
                  <div key={entry.name} className="flex items-center px-3 py-1 bg-white/50 rounded-full border border-white/40">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center text-slate-400">
              <p>No expenses recorded yet.</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 rounded-2xl transition-all border border-transparent hover:border-indigo-100">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                    t.type === 'income' ? 'bg-emerald-100/80' : 'bg-indigo-50/80'
                  }`}>
                    {t.type === 'income' ? '💰' : (CATEGORY_ICONS[t.displayCategory] || '📄')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm truncate max-w-[120px]">
                      {t.displayMerchant}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? '+' : '-'}{currentSymbol}{t.amount.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.displayCategory}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};