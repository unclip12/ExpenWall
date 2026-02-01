import React, { useState } from 'react';
import { X, Plus, Trash2, Zap, MapPin, Users, Package } from 'lucide-react';
import { Transaction, Category } from '../types';
import { CATEGORIES } from '../constants';

interface SmartTransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onClose: () => void;
  shops: any[];
  persons: any[];
}

export const SmartTransactionForm: React.FC<SmartTransactionFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    merchant: '', amount: 0, category: Category.OTHER, type: 'expense', date: new Date().toISOString().split('T')[0], ...initialData
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as Transaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-white">New Transaction</h2>
          <button onClick={onClose}><X className="w-6 h-6 dark:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Merchant" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.merchant} onChange={e => setFormData({...formData, merchant: e.target.value})} required />
          <input type="number" placeholder="Amount" className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} required />
          <select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 p-2 rounded-xl ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>Expense</button>
            <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 p-2 rounded-xl ${formData.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>Income</button>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Save</button>
        </form>
      </div>
    </div>
  );
};