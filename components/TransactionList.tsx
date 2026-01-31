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

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesCurrency = filterCurrency === 'All' || (t.currency || DEFAULT_CURRENCY) === filterCurrency;
    return matchesSearch && matchesCategory && matchesCurrency;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSymbol = (currencyCode?: string) => {
      const code = currencyCode || DEFAULT_CURRENCY;
      return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          
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
                <th className="p-4">Items</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 text-xs font-bold">
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
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                    {t.items?.map(i => i.name).join(', ') || '-'}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800 text-sm">
                    {getSymbol(t.currency)}{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
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