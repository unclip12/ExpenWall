import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Initialize currency from localStorage if available, otherwise use default
  // We use a simple read here, assuming the App re-renders or the user refreshes after settings change.
  // In a more complex app, we'd use a Context or a store.
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;

  // Filter transactions by currency and sort by date
  const filteredTransactions = transactions.filter(t => (t.currency || DEFAULT_CURRENCY) === currency);
  const totalSpent = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const recentTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  // Prepare data for category chart
  const categoryData = Object.values(Category).map(cat => ({
    name: cat,
    value: filteredTransactions.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0)
  })).filter(item => item.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const currentSymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  
  // Mock budget scaling (approximate for demo purposes - simple logic for USD/EUR vs high-denomination currencies)
  const isHighDenomination = ['INR', 'JPY', 'KRW', 'IDR', 'VND'].includes(currency);
  const budgetAmount = isHighDenomination ? 200000 : 2500; 

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-xl">
              {currentSymbol}
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +2.5%
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Spent</p>
          <h3 className="text-3xl font-bold text-slate-800">{currentSymbol}{totalSpent.toFixed(2)}</h3>
        </div>

        {/* Summary Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Transactions</p>
          <h3 className="text-3xl font-bold text-slate-800">{filteredTransactions.length}</h3>
        </div>

        {/* Summary Card 3 - Budget (Mock) */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-indigo-100 text-sm font-medium mb-1">Monthly Budget</p>
          <h3 className="text-3xl font-bold mb-4">{currentSymbol}{budgetAmount.toLocaleString()}</h3>
          <div className="w-full bg-indigo-800/50 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${Math.min((totalSpent / budgetAmount) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-indigo-200">
            {Math.round((totalSpent / budgetAmount) * 100)}% used
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Spending by Category</h3>
          
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
                <p>No transactions for this currency.</p>
            </div>
          )}
        </div>

        {/* Recent Transactions List (Mini) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    {t.category === Category.FOOD ? '🍔' : 
                     t.category === Category.TRANSPORT ? '🚗' : 
                     t.category === Category.SHOPPING ? '🛍️' : '📄'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.merchant}</p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">-{currentSymbol}{t.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{t.category}</p>
                </div>
              </div>
            )) : (
                <div className="p-4 text-center text-slate-400 text-sm">
                    No recent transactions.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};