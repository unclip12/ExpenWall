import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown, Loader2, CheckCircle } from 'lucide-react';
import { Budget, BudgetStatus, Category, Transaction } from '../types';
import { subscribeToBudgets, addBudget, updateBudget, deleteBudget } from '../services/firestoreService';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface BudgetViewProps {
  userId: string;
  transactions: Transaction[];
}

export const BudgetView: React.FC<BudgetViewProps> = ({ userId, transactions }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: Category.FOOD,
    amount: 0,
    period: 'monthly' as 'weekly' | 'monthly',
    alertAt80: true,
    alertAt100: true,
  });

  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';

  useEffect(() => {
    const unsub = subscribeToBudgets(userId, setBudgets);
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    // Calculate budget statuses
    const now = new Date();
    const statuses: BudgetStatus[] = budgets.map(budget => {
      // Calculate period start date
      const periodStart = new Date(budget.startDate);
      if (budget.period === 'monthly') {
        periodStart.setMonth(now.getMonth());
        periodStart.setFullYear(now.getFullYear());
      } else {
        // Weekly: get start of current week
        const dayOfWeek = now.getDay();
        periodStart.setDate(now.getDate() - dayOfWeek);
      }

      // Calculate spent in period
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          new Date(t.date) >= periodStart &&
          new Date(t.date) <= now
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budget.amount,
      };
    });

    setBudgetStatuses(statuses);
  }, [budgets, transactions]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget.amount <= 0) return;

    setIsAdding(true);
    try {
      await addBudget({
        ...newBudget,
        startDate: new Date().toISOString().split('T')[0],
      }, userId);

      // Reset form
      setNewBudget({
        category: Category.FOOD,
        amount: 0,
        period: 'monthly',
        alertAt80: true,
        alertAt100: true,
      });
    } catch (error) {
      console.error('Failed to add budget:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await deleteBudget(id);
  };

  const getProgressColor = (percentage: number, isOver: boolean) => {
    if (isOver) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStatusIcon = (status: BudgetStatus) => {
    if (status.isOverBudget) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (status.percentage >= 80) return <TrendingUp className="w-5 h-5 text-orange-500" />;
    return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Budget Manager</h2>
            <p className="text-indigo-100">Track spending limits per category</p>
          </div>
        </div>
      </div>

      {/* Add New Budget Form */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Create Budget</h3>
        <form onSubmit={handleAddBudget} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value as Category }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.filter(c => c !== Category.INCOME).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500 font-medium">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.amount || ''}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Period</label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value as 'weekly' | 'monthly' }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding || newBudget.amount <= 0}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span>Create Budget</span>
          </button>
        </form>
      </div>

      {/* Budget Cards */}
      {budgetStatuses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400">No budgets set yet. Create one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetStatuses.map((status) => (
            <div
              key={status.budget.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{status.budget.category}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {status.budget.period}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBudget(status.budget.id)}
                  className="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-300">
                    Spent: {currencySymbol}{status.spent.toFixed(2)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Budget: {currencySymbol}{status.budget.amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(status.percentage, status.isOverBudget)}`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className={`font-bold ${status.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {status.percentage.toFixed(1)}% used
                  </span>
                  <span className={`font-bold ${status.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {status.remaining >= 0 ? currencySymbol : '-' + currencySymbol}{Math.abs(status.remaining).toFixed(2)} {status.remaining >= 0 ? 'left' : 'over'}
                  </span>
                </div>
              </div>

              {/* Alerts */}
              {status.isOverBudget && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-300 font-medium">Budget exceeded!</span>
                </div>
              )}
              {status.percentage >= 80 && !status.isOverBudget && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Almost at limit!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};