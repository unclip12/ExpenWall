
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Zap, 
  MapPin, 
  Users, 
  Package, 
  BatteryCharging
} from 'lucide-react';
import { Transaction, Category, ShopLocation, TransactionItem } from '../types';
import { getSubcategorySuggestions, formatCurrency } from '../utils/transactionUtils';
import { CATEGORIES } from '../constants';

interface SmartTransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onClose: () => void;
  shops: ShopLocation[];
  persons: any[];
}

export const SmartTransactionForm: React.FC<SmartTransactionFormProps> = ({
  initialData,
  onSubmit,
  onClose,
  shops,
  persons
}) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    merchant: '',
    amount: 0,
    category: Category.OTHER,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    items: [],
    notes: '',
    ...initialData
  });
  
  const [subcategorySuggestions, setSubcategorySuggestions] = useState<any[]>([]);
  const [shopSuggestions, setShopSuggestions] = useState(shops);
  const [personSuggestions, setPersonSuggestions] = useState(persons);
  const [showContextForm, setShowContextForm] = useState<'none' | 'shop' | 'utility' | 'person' | 'multi-item'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const merchant = formData.merchant?.toLowerCase().trim();
    if (!merchant) return;

    const matchingShops = shops.filter(shop => 
      shop.shopName.toLowerCase().includes(merchant) ||
      merchant.includes(shop.shopName.toLowerCase())
    );
    setShopSuggestions(matchingShops.slice(0, 5));

    const matchingPersons = persons.filter(person => 
      person.name.toLowerCase().includes(merchant)
    );
    setPersonSuggestions(matchingPersons.slice(0, 5));

    if (['electricity', 'power', 'bescom', 'bill'].some(word => merchant.includes(word))) {
      setShowContextForm('utility');
      setFormData(prev => ({ ...prev, category: Category.UTILITIES, subcategory: 'Electricity' }));
    } else if (['water', 'bwssb'].some(word => merchant.includes(word))) {
      setShowContextForm('utility');
      setFormData(prev => ({ ...prev, category: Category.UTILITIES, subcategory: 'Water' }));
    } else if (['gas', 'lpg', 'cylinder', 'indane'].some(word => merchant.includes(word))) {
      setShowContextForm('utility');
      setFormData(prev => ({ ...prev, category: Category.UTILITIES, subcategory: 'Gas/LPG' }));
    } else if (persons.some(p => p.name.toLowerCase().includes(merchant))) {
      setShowContextForm('person');
    } else if (['d mart', 'dmart', 'bigbasket', 'blinkit'].some(word => merchant.includes(word))) {
      setShowContextForm('multi-item');
    } else {
      setShowContextForm('shop');
    }

    const suggestions = getSubcategorySuggestions(merchant);
    setSubcategorySuggestions(suggestions);
  }, [formData.merchant, shops, persons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData as Transaction);
      onClose();
    } catch (error) {
      console.error('Transaction save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', price: 0, quantity: 1 }]
    }));
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const totalItemsAmount = (formData.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {formData.merchant ? `Edit ${formData.merchant}` : 'New Transaction'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Merchant / Shop / Person</label>
            <div className="relative">
              <input
                type="text"
                value={formData.merchant || ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="DMart, Rapido, Rohit, Electricity bill..."
                className="w-full px-4 py-3 pl-12 pr-12 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Zap className={`absolute right-4 top-3.5 w-5 h-5 transition-colors ${
                showContextForm !== 'none' ? 'text-emerald-500' : 'text-slate-400'
              }`} />
            </div>

            {shopSuggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>Recent Shops:</span>
                </div>
                {shopSuggestions.map((shop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, merchant: shop.shopName })}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-left text-sm truncate"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{shop.shopName}</span>
                    {shop.area && <span className="text-slate-400 ml-auto">• {shop.area}</span>}
                  </button>
                ))}
              </div>
            )}

            {personSuggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                  <Users className="w-3 h-3" />
                  <span>Recent Contacts:</span>
                </div>
                {personSuggestions.map((person, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, merchant: person.name });
                      setShowContextForm('person');
                    }}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-left text-sm"
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{person.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{person.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-3 pl-12 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                required
              />
              <span className="absolute left-4 top-3.5 text-slate-500 font-semibold">₹</span>
            </div>
            {totalItemsAmount > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Items total: {formatCurrency(totalItemsAmount)} • Difference: {formatCurrency(Math.abs((formData.amount || 0) - totalItemsAmount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`p-3 rounded-2xl font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`p-3 rounded-2xl font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subcategory</label>
              <input
                type="text"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Auto-suggested"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {subcategorySuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subcategorySuggestions.slice(0, 5).map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, subcategory: suggestion.subcategory, category: suggestion.category })}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center space-x-1"
                >
                  <span>{suggestion.emoji}</span>
                  <span>{suggestion.subcategory}</span>
                </button>
              ))}
            </div>
          )}

          {showContextForm === 'utility' && formData.subcategory === 'Electricity' && (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 mb-4">
                <BatteryCharging className="w-6 h-6" />
                <h4 className="font-bold text-lg">Electricity Bill Details</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Units Consumed</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => {
                      const units = parseFloat(e.target.value) || 0;
                      const pricePerUnit = units > 0 ? (formData.amount || 0) / units : 0;
                      setFormData({
                        ...formData,
                        utilityDetails: {
                          type: 'electricity',
                          units,
                          pricePerUnit: parseFloat(pricePerUnit.toFixed(2))
                        }
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Price per Unit</label>
                  <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl">
                    <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                      ₹{formData.utilityDetails?.pricePerUnit?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Property</label>
                <select
                  className="w-full px-4 py-3 border border-amber-200 dark:border-amber-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                  onChange={(e) => setFormData({
                    ...formData,
                    utilityDetails: { ...formData.utilityDetails, propertyName: e.target.value }
                  })}
                >
                  <option value="">Select property...</option>
                  <option value="PG">PG/Hostel</option>
                  <option value="Rental Home">Rental Home</option>
                  <option value="Own House">Own House</option>
                </select>
              </div>
            </div>
          )}

          {showContextForm === 'multi-item' && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200">
                  <Package className="w-6 h-6" />
                  <h4 className="font-bold text-lg">Items Purchased</h4>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-start p-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Brand"
                        value={item.brand || ''}
                        onChange={(e) => updateItem(idx, 'brand', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(formData.items || []).length === 0 && (
                <p className="text-center text-slate-500 py-4">Click "Add Item" to start adding products</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 -mx-6 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.merchant || !formData.amount}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
