import React, { useState, useEffect } from 'react';
import { Transaction, Category, MerchantRule, TransactionType } from '../types';
import { Search, Filter, Calendar, Edit2, Check, X, Sparkles } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY, CATEGORIES } from '../constants';
import { updateTransactionInDb, addMerchantRule } from '../services/firestoreService';

interface TransactionListProps {
  transactions: Transaction[];
  rules: MerchantRule[];
  userId: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, rules, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [originalMerchant, setOriginalMerchant] = useState('');
  const [showRulePrompt, setShowRulePrompt] = useState(false);

  // Preferred Currency override
  const preferredCurrency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === preferredCurrency)?.symbol || '₹';

  // Apply Rules to Transactions for DISPLAY
  const processedTransactions = transactions.map(t => {
      const rule = rules.find(r => r.originalName.toLowerCase() === t.merchant.toLowerCase());
      if (rule) {
          return {
              ...t,
              displayMerchant: rule.renamedTo,
              displayCategory: rule.forcedCategory || t.category,
              isAliased: true
          };
      }
      return { ...t, displayMerchant: t.merchant, displayCategory: t.category, isAliased: false };
  });

  const filteredTransactions = processedTransactions.filter(t => {
    const matchesSearch = t.displayMerchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.displayCategory === filterCategory;
    const matchesType = filterType === 'All' || (t.type || 'expense') === filterType;
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditClick = (t: any) => {
      // When editing, we populate with the RAW data (not aliased), or we can populate with Aliased.
      // Strategy: Populate with RAW data so user sees "Lashmi M" and can change it to "Manasa".
      setEditingId(t.id);
      setOriginalMerchant(t.merchant);
      setEditForm({
          merchant: t.merchant,
          amount: t.amount,
          date: t.date,
          category: t.category,
          type: t.type
      });
      setShowRulePrompt(false);
  };

  const handleSave = async () => {
      if (!editingId || !editForm.merchant) return;
      
      // Update the transaction
      await updateTransactionInDb(editingId, editForm);

      // Logic: If user changed the name or category, ask to create a rule
      const nameChanged = editForm.merchant !== originalMerchant;
      // We also check if we want to create a rule for the *original* merchant to map to *new* inputs
      // But if we just updated the transaction text directly, the rule logic is slightly different.
      // If user typed "Manasa" over "Lashmi M", we want a rule: "Lashmi M" -> "Manasa"
      
      // However, since we just overwrote "Lashmi M" in the DB with "Manasa", the next time this specific transaction loads, it is "Manasa".
      // The rule is useful for FUTURE imports or other existing "Lashmi M" entries.
      
      if (nameChanged) {
           // We prompt to see if user wants to map ORIGINAL -> NEW
           setShowRulePrompt(true);
      } else {
          setEditingId(null);
      }
  };

  const confirmRule = async () => {
      if (!originalMerchant || !editForm.merchant) return;
      
      await addMerchantRule({
          userId,
          originalName: originalMerchant,
          renamedTo: editForm.merchant,
          forcedCategory: editForm.category
      });
      setEditingId(null);
      setShowRulePrompt(false);
  };

  const cancelEdit = () => {
      setEditingId(null);
      setShowRulePrompt(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
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
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  {editingId === t.id ? (
                      <td colSpan={5} className="p-4 bg-indigo-50/30">
                          {showRulePrompt ? (
                              <div className="flex flex-col space-y-3 p-2">
                                  <div className="flex items-center text-indigo-700 font-medium">
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      <span>Save as Smart Rule?</span>
                                  </div>
                                  <p className="text-sm text-slate-600">
                                      Whenever I see <b>"{originalMerchant}"</b>, should I automatically rename it to <b>"{editForm.merchant}"</b>?
                                  </p>
                                  <div className="flex space-x-3 mt-2">
                                      <button onClick={confirmRule} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Yes, Remember Rule</button>
                                      <button onClick={() => setEditingId(null)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium">No, Just Once</button>
                                  </div>
                              </div>
                          ) : (
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 space-y-2">
                                    <input 
                                        value={editForm.merchant}
                                        onChange={e => setEditForm(prev => ({...prev, merchant: e.target.value}))}
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        placeholder="Merchant Name"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={editForm.type}
                                            onChange={e => setEditForm(prev => ({...prev, type: e.target.value as TransactionType}))}
                                            className="p-2 border border-slate-300 rounded text-sm"
                                        >
                                            <option value="expense">Expense</option>
                                            <option value="income">Income</option>
                                        </select>
                                        <input 
                                            type="date"
                                            value={editForm.date}
                                            onChange={e => setEditForm(prev => ({...prev, date: e.target.value}))}
                                            className="p-2 border border-slate-300 rounded text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input 
                                        type="number"
                                        value={editForm.amount}
                                        onChange={e => setEditForm(prev => ({...prev, amount: parseFloat(e.target.value)}))}
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        placeholder="Amount"
                                    />
                                    <select 
                                        value={editForm.category}
                                        onChange={e => setEditForm(prev => ({...prev, category: e.target.value as Category}))}
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                    <button onClick={handleSave} className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"><Check className="w-4 h-4"/></button>
                                    <button onClick={cancelEdit} className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X className="w-4 h-4"/></button>
                                </div>
                            </div>
                          )}
                      </td>
                  ) : (
                    <>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                              t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {t.displayMerchant.charAt(0)}
                          </div>
                          <div>
                              <span className="font-medium text-slate-700 text-sm block">{t.displayMerchant}</span>
                              {t.isAliased && <span className="text-[10px] text-indigo-400 flex items-center"><Sparkles className="w-3 h-3 mr-1"/> Rule Applied</span>}
                          </div>
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
                          {t.displayCategory}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold text-sm ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                          <button onClick={() => handleEditClick(t)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                          </button>
                      </td>
                    </>
                  )}
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