import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { BuyingItem } from '../types';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { addBuyingItem, updateBuyingItemStatus, deleteBuyingItem } from '../services/firestoreService';

interface BuyingListViewProps {
  items: BuyingItem[];
  userId: string;
}

export const BuyingListView: React.FC<BuyingListViewProps> = ({ items, userId }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track individual item loading states for responsiveness
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());

  const currencyCode = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currencyCode)?.symbol || '$';

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsAdding(true);
    setError(null);
    
    try {
      await addBuyingItem({
        name: newItemName.trim(),
        estimatedPrice: newItemPrice ? parseFloat(newItemPrice) : 0,
        currency: currencyCode,
        isBought: false
      }, userId);
      
      // Success: Clear form
      setNewItemName('');
      setNewItemPrice('');
    } catch (err: any) {
      console.error("Failed to add item:", err);
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (item: BuyingItem) => {
    setTogglingItems(prev => new Set(prev).add(item.id));
    try {
      await updateBuyingItemStatus(item.id, !item.isBought);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setTogglingItems(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Remove this item from the list?')) {
      await deleteBuyingItem(itemId);
    }
  };

  // Calculations
  const unboughtItems = items.filter(i => !i.isBought);
  const boughtItems = items.filter(i => i.isBought);
  const totalEstimated = unboughtItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex justify-between items-center">
        <div>
          <p className="text-violet-100 text-sm font-medium mb-1">Estimated Cost</p>
          <h2 className="text-3xl font-bold">{currencySymbol}{totalEstimated.toFixed(2)}</h2>
          <p className="text-xs text-violet-200 mt-2">{unboughtItems.length} items to buy</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <ShoppingCart className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Add New Item Form */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="What do you need to buy?"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={isAdding}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
          />
          <div className="relative w-full md:w-40">
            <span className="absolute left-3 top-3.5 text-slate-400 text-sm">{currencySymbol}</span>
            <input
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              disabled={isAdding}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newItemName.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 min-w-[100px]"
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </>
            )}
          </button>
        </form>
        {error && (
            <div className="mt-3 flex items-center text-red-500 text-sm bg-red-50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
            </div>
        )}
      </div>

      {/* Lists */}
      <div className="space-y-4">
        {items.length === 0 && !isAdding && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Your buying list is empty.</p>
          </div>
        )}

        {/* To Buy List */}
        {unboughtItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 text-sm">
              To Buy
            </div>
            <div className="divide-y divide-slate-50">
              {unboughtItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1">
                    <button 
                      onClick={() => handleToggleStatus(item)} 
                      disabled={togglingItems.has(item.id)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {togglingItems.has(item.id) ? (
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      ) : (
                          <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-sm">
                      {currencySymbol}{item.estimatedPrice.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bought List */}
        {boughtItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-75">
             <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 text-sm flex justify-between">
              <span>Bought</span>
              <span className="text-xs font-normal">Items here are not included in total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {boughtItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1">
                    <button 
                      onClick={() => handleToggleStatus(item)} 
                      disabled={togglingItems.has(item.id)}
                      className="text-emerald-500 hover:text-slate-400 transition-colors disabled:opacity-50"
                    >
                      {togglingItems.has(item.id) ? (
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      ) : (
                          <CheckCircle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-slate-400 line-through decoration-slate-300">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-slate-400 text-sm">
                      {currencySymbol}{item.estimatedPrice.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};