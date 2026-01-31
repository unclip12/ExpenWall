import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { Search, Filter, Calendar } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCurrency, setFilterCurrency] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesCurrency = filterCurrency === 'All' || (t.currency || DEFAULT_CURRENCY) === filterCurrency;
    // Backwards compatibility: undefined type is expense
    const matchesType = filterType === 'All' || (t.type || 'expense') === filterType;
    return matchesSearch && matchesCategory && matchesCurrency && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSymbol = (currencyCode?: string) => {
      const code = currencyCode || DEFAULT_CURRENCY;
      return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          
           <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

           <select 
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Currencies</option>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="p-4">Merchant</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                          t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {t.merchant.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700 text-sm">{t.merchant}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2 opacity-50" />
                      {t.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold text-sm ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{getSymbol(t.currency)}{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};