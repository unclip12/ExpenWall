import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Play, Pause, Calendar, Loader2, AlertCircle, CalendarClock } from 'lucide-react';
import { RecurringTransaction, Category } from '../types';
import { subscribeToRecurringTransactions, addRecurringTransaction, deleteRecurringTransaction, toggleRecurringActive, addTransactionToDb } from '../services/firestoreService';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY, RECURRING_FREQUENCIES } from '../constants';

interface RecurringViewProps {
  userId: string;
}

export const RecurringView: React.FC<RecurringViewProps> = ({ userId }) => {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecurring, setNewRecurring] = useState({
    merchant: '',
    amount: 0,
    category: Category.UTILITIES,
    type: 'expense' as 'expense' | 'income',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    startDate: new Date().toISOString().split('T')[0],
  });

  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';

  useEffect(() => {
    const unsub = subscribeToRecurringTransactions(userId, setRecurring);
    return () => unsub();
  }, [userId]);

  const calculateNextDueDate = (frequency: RecurringTransaction['frequency'], lastDate: string): string => {
    const date = new Date(lastDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecurring.merchant || newRecurring.amount <= 0) return;

    setIsAdding(true);
    try {
      const nextDue = calculateNextDueDate(newRecurring.frequency, newRecurring.startDate);
      await addRecurringTransaction({
        ...newRecurring,
        currency,
        nextDueDate: nextDue,
        isActive: true,
      }, userId);

      // Reset form
      setNewRecurring({
        merchant: '',
        amount: 0,
        category: Category.UTILITIES,
        type: 'expense',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to add recurring:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (rec: RecurringTransaction) => {
    await toggleRecurringActive(rec.id, !rec.isActive);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring transaction?')) return;
    await deleteRecurringTransaction(id);
  };

  const handleGenerateNow = async (rec: RecurringTransaction) => {
    if (!confirm(`Generate transaction for ${rec.merchant} now?`)) return;
    
    try {
      await addTransactionToDb({
        merchant: rec.merchant,
        amount: rec.amount,
        category: rec.category,
        type: rec.type,
        currency: rec.currency,
        date: new Date().toISOString().split('T')[0],
        isRecurring: true,
        recurringId: rec.id,
      }, userId);

      alert('Transaction generated!');
    } catch (error) {
      console.error('Failed to generate:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Recurring Transactions</h2>
            <p className="text-violet-100">Auto-track subscriptions & bills</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Add Recurring</h3>
        <form onSubmit={handleAddRecurring} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
              <input
                type="text"
                value={newRecurring.merchant}
                onChange={(e) => setNewRecurring(prev => ({ ...prev, merchant: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Netflix, Electricity, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={newRecurring.amount || ''}
                  onChange={(e) => setNewRecurring(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Frequency</label>
              <select
                value={newRecurring.frequency}
                onChange={(e) => setNewRecurring(prev => ({ ...prev, frequency: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {RECURRING_FREQUENCIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={newRecurring.category}
                onChange={(e) => setNewRecurring(prev => ({ ...prev, category: e.target.value as Category }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full md:w-auto px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span>Add Recurring</span>
          </button>
        </form>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-purple-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
             <CalendarClock className="w-12 h-12 text-purple-400 dark:text-purple-300" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Recurring Payments</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
             Automatically track subscriptions, rent, and bills by adding them here.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recurring.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border transition-all ${
                rec.isActive ? 'border-slate-100 dark:border-slate-700' : 'border-slate-200 dark:border-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{rec.merchant}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{rec.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(rec)}
                    className={`p-2 rounded-lg transition-colors ${
                      rec.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                    title={rec.isActive ? 'Pause' : 'Activate'}
                  >
                    {rec.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{currencySymbol}{rec.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Frequency:</span>
                  <span className="font-medium text-slate-800 dark:text-white capitalize">{rec.frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Next Due:</span>
                  <span className="font-medium text-slate-800 dark:text-white flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {rec.nextDueDate}
                  </span>
                </div>
              </div>

              {rec.isActive && (
                <button
                  onClick={() => handleGenerateNow(rec)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                >
                  Generate Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};