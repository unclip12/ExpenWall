import React, { useState } from 'react';
import { Transaction, Category, MerchantRule, TransactionType, Wallet } from '../types';
import { Search, Filter, Calendar, Edit2, Check, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY, CATEGORIES } from '../constants';
import { updateTransactionInDb, addMerchantRule } from '../services/firestoreService';

interface TransactionListProps {
  transactions: Transaction[];
  rules: MerchantRule[];
  userId: string;
  wallets?: Wallet[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, rules, userId, wallets = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [originalMerchant, setOriginalMerchant] = useState('');
  const [showRulePrompt, setShowRulePrompt] = useState(false);
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const getWalletName = (id?: string) => {
      if (!id) return null;
      const w = wallets.find(w => w.id === id);
      return w ? w.name : null;
  };

  const handleEditClick = (t: any) => {
      setEditingId(t.id);
      setOriginalMerchant(t.merchant);
      setEditForm({
          merchant: t.merchant,
          amount: t.amount,
          date: t.date,
          category: t.category,
          type: t.type,
          walletId: t.walletId
      });
      setShowRulePrompt(false);
  };

  const handleSave = async () => {
      if (!editingId || !editForm.merchant) return;
      
      setIsSavingEdit(true);
      try {
        await updateTransactionInDb(editingId, editForm);

        const nameChanged = editForm.merchant !== originalMerchant;
        if (nameChanged) {
             setShowRulePrompt(true);
        } else {
            setEditingId(null);
        }
      } catch (error) {
        console.error("Failed to update transaction", error);
      } finally {
        setIsSavingEdit(false);
      }
  };

  const confirmRule = async () => {
      if (!originalMerchant || !editForm.merchant) return;
      
      setIsSavingRule(true);
      try {
          await addMerchantRule({
              userId,
              originalName: originalMerchant,
              renamedTo: editForm.merchant,
              forcedCategory: editForm.category
          });
          setEditingId(null);
          setShowRulePrompt(false);
      } catch (error) {
          console.error("Error saving rule:", error);
      } finally {
          setIsSavingRule(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters - Glass Style */}
      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/20 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/60 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
           <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white/60 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List - Glass Cards */}
      <div className="space-y-3">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
                {editingId === t.id ? (
                    <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                         {showRulePrompt ? (
                              <div className="flex flex-col space-y-3 p-2">
                                  <div className="flex items-center text-indigo-700 font-bold">
                                      <Sparkles className="w-5 h-5 mr-2" />
                                      <span>Create Smart Rule?</span>
                                  </div>
                                  <p className="text-sm text-slate-600 bg-white/50 p-3 rounded-lg border border-white/40">
                                      Rename <b>"{originalMerchant}"</b> <ArrowRight className="inline w-3 h-3"/> <b>"{editForm.merchant}"</b> automatically?
                                  </p>
                                  <div className="flex space-x-3 mt-2">
                                      <button 
                                        onClick={confirmRule} 
                                        disabled={isSavingRule}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md flex items-center"
                                      >
                                          {isSavingRule ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Yes, Remember'}
                                      </button>
                                      <button onClick={() => setEditingId(null)} className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-xl text-sm font-medium">No, Just Once</button>
                                  </div>
                              </div>
                          ) : (
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 space-y-2">
                                    <input 
                                        value={editForm.merchant}
                                        onChange={e => setEditForm(prev => ({...prev, merchant: e.target.value}))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Merchant Name"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={editForm.type}
                                            onChange={e => setEditForm(prev => ({...prev, type: e.target.value as TransactionType}))}
                                            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                        >
                                            <option value="expense">Expense</option>
                                            <option value="income">Income</option>
                                        </select>
                                        <input 
                                            type="date"
                                            value={editForm.date}
                                            onChange={e => setEditForm(prev => ({...prev, date: e.target.value}))}
                                            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                    <select 
                                        value={editForm.walletId}
                                        onChange={e => setEditForm(prev => ({...prev, walletId: e.target.value}))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">No Wallet</option>
                                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input 
                                        type="number"
                                        value={editForm.amount}
                                        onChange={e => setEditForm(prev => ({...prev, amount: parseFloat(e.target.value)}))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Amount"
                                    />
                                    <select 
                                        value={editForm.category}
                                        onChange={e => setEditForm(prev => ({...prev, category: e.target.value as Category}))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                    <button 
                                      onClick={handleSave} 
                                      disabled={isSavingEdit}
                                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm flex items-center justify-center disabled:opacity-50"
                                    >
                                      {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><X className="w-4 h-4"/></button>
                                </div>
                            </div>
                          )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-inner ${
                                  t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {t.type === 'income' ? '💰' : 
                                 t.displayCategory === Category.FOOD ? '🍔' : 
                                 t.displayCategory === Category.TRANSPORT ? '🚗' : 
                                 t.displayCategory === Category.SHOPPING ? '🛍️' : '📄'}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                                      {t.displayMerchant}
                                      {t.isAliased && <Sparkles className="w-3 h-3 text-indigo-400" />}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 opacity-70" /> {t.date}</span>
                                      {getWalletName(t.walletId) && (
                                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium border border-slate-200">
                                              {getWalletName(t.walletId)}
                                          </span>
                                      )}
                                  </div>
                              </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="text-right">
                                  <p className={`font-bold text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                                  </p>
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-slate-100/80 text-slate-600">
                                      {t.displayCategory}
                                  </span>
                             </div>
                             <button 
                                onClick={() => handleEditClick(t)} 
                                className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                             >
                                  <Edit2 className="w-4 h-4" />
                             </button>
                         </div>
                    </div>
                )}
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white/40 rounded-3xl border border-white/20">
                No transactions found.
            </div>
          )}
      </div>
    </div>
  );
};