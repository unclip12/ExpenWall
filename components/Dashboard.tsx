import React from 'react';
import { Transaction, Category } from '../types';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currentSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  // Filter transactions by currency and sort by date
  const filteredTransactions = transactions.filter(t => (t.currency || DEFAULT_CURRENCY) === currency);
  
  // Calculate Totals
  const totalSpent = filteredTransactions
    .filter(t => t.type === 'expense' || t.type === undefined) // Backwards compatibility: undefined is expense
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalSpent;

  const recentTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  // Prepare data for category chart (Only Expenses)
  const categoryData = Object.values(Category)
    .filter(cat => cat !== Category.INCOME) // Don't show Income in expense pie chart
    .map(cat => ({
      name: cat,
      value: filteredTransactions
        .filter(t => (t.type === 'expense' || !t.type) && t.category === cat)
        .reduce((acc, t) => acc + t.amount, 0)
    }))
    .filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Income</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{currentSymbol}{totalIncome.toFixed(2)}</h3>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expense</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">{currentSymbol}{totalSpent.toFixed(2)}</h3>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-white/20 rounded-lg">
               <Wallet className="w-6 h-6 text-white" />
             </div>
             <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className="text-3xl font-bold">{currentSymbol}{netBalance.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${currentSymbol}${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-xs text-slate-600">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
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

        {/* Recent Transactions List (Mini) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.type === 'income' ? '💰' : 
                     t.category === Category.FOOD ? '🍔' : 
                     t.category === Category.TRANSPORT ? '🚗' : 
                     t.category === Category.SHOPPING ? '🛍️' : '📄'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm truncate max-w-[120px]">{t.merchant}</p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? '+' : '-'}{currentSymbol}{t.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{t.category}</p>
                </div>
              </div>
            )) : (
                <div className="p-4 text-center text-slate-400 text-sm">
                    No recent activity.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};