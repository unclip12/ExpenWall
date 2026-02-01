import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ShoppingCart, AlertCircle, Loader2, X, MapPin, Store } from 'lucide-react';
import { BuyingItem, Category } from '../types';
import { CURRENCIES, DEFAULT_CURRENCY, CATEGORIES } from '../constants';
import { addBuyingItem, updateBuyingItemStatus, deleteBuyingItem, addTransactionToDb } from '../services/firestoreService';

interface BuyingListViewProps {
  items: BuyingItem[];
  userId: string;
}

export const BuyingListView: React.FC<BuyingListViewProps> = ({ items, userId }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());
  
  // Purchase Modal State
  const [purchaseModalItem, setPurchaseModalItem] = useState<BuyingItem | null>(null);
  const [purchaseData, setPurchaseData] = useState({
    actualPrice: '',
    merchant: '',
    category: Category.SHOPPING,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);

  const currencyCode = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currencyCode)?.symbol || '₹';

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
      
      setNewItemName('');
      setNewItemPrice('');
    } catch (err: any) {
      console.error("Failed to add item:", err);
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleMarkAsBought = (item: BuyingItem) => {
    setPurchaseModalItem(item);
    setPurchaseData({
      actualPrice: item.estimatedPrice.toString(),
      merchant: '',
      category: Category.SHOPPING,
      date: new Date().toISOString().split('T')[0],
      notes: `Purchased: ${item.name}`
    });
  };

  const handleSavePurchase = async () => {
    if (!purchaseModalItem) return;
    
    setIsSavingPurchase(true);
    try {
      // Create transaction
      await addTransactionToDb({
        merchant: purchaseData.merchant || 'Purchase',
        amount: parseFloat(purchaseData.actualPrice) || purchaseModalItem.estimatedPrice,
        category: purchaseData.category,
        type: 'expense',
        date: purchaseData.date,
        currency: currencyCode,
        notes: purchaseData.notes,
        items: [{
          name: purchaseModalItem.name,
          price: parseFloat(purchaseData.actualPrice) || purchaseModalItem.estimatedPrice,
          quantity: 1
        }]
      }, userId);
      
      // Mark item as bought
      await updateBuyingItemStatus(purchaseModalItem.id, true);
      
      // Close modal
      setPurchaseModalItem(null);
      setPurchaseData({
        actualPrice: '',
        merchant: '',
        category: Category.SHOPPING,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error("Failed to save purchase:", error);
      alert('Failed to save purchase. Please try again.');
    } finally {
      setIsSavingPurchase(false);
    }
  };

  const handleToggleStatus = async (item: BuyingItem) => {
    if (!item.isBought) {
      // If marking as bought, open purchase modal
      handleMarkAsBought(item);
    } else {
      // If unmarking, just toggle
      setTogglingItems(prev => new Set(prev).add(item.id));
      try {
        await updateBuyingItemStatus(item.id, false);
      } catch (error) {
        console.error("Failed to update status", error);
      } finally {
        setTogglingItems(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Remove this item from the list?')) {
      await deleteBuyingItem(itemId);
    }
  };

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
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="What do you need to buy?"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={isAdding}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 dark:text-white"
          />
          <div className="relative w-full md:w-40">
            <span className="absolute left-3 top-3.5 text-slate-400 text-sm">{currencySymbol}</span>
            <input
              type="number"
              placeholder="Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              disabled={isAdding}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 dark:text-white"
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
          <div className="mt-3 flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="space-y-4">
        {items.length === 0 && !isAdding && (
          <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Your buying list is empty.</p>
          </div>
        )}

        {/* To Buy List */}
        {unboughtItems.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm">
              To Buy
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {unboughtItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1">
                    <button 
                      onClick={() => handleToggleStatus(item)} 
                      disabled={togglingItems.has(item.id)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors disabled:opacity-50"
                      title="Mark as purchased"
                    >
                      {togglingItems.has(item.id) ? (
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-75">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-500 dark:text-slate-400 text-sm flex justify-between">
              <span>Bought</span>
              <span className="text-xs font-normal">Items here are not included in total</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {boughtItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1">
                    <button 
                      onClick={() => handleToggleStatus(item)} 
                      disabled={togglingItems.has(item.id)}
                      className="text-emerald-500 hover:text-slate-400 transition-colors disabled:opacity-50"
                      title="Unmark as purchased"
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

      {/* Purchase Confirmation Modal */}
      {purchaseModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPurchaseModalItem(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Mark as Purchased</h2>
                <p className="text-emerald-100 text-sm mt-1">{purchaseModalItem.name}</p>
              </div>
              <button
                onClick={() => setPurchaseModalItem(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Actual Price */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Actual Price Paid</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">{currencySymbol}</span>
                  <input
                    type="number"
                    value={purchaseData.actualPrice}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, actualPrice: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    step="0.01"
                    required
                  />
                </div>
                {parseFloat(purchaseData.actualPrice) !== purchaseModalItem.estimatedPrice && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Estimated: {currencySymbol}{purchaseModalItem.estimatedPrice.toFixed(2)} 
                    {parseFloat(purchaseData.actualPrice) > purchaseModalItem.estimatedPrice ? ' (Higher)' : ' (Lower)'}
                  </p>
                )}
              </div>

              {/* Merchant/Shop */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Where did you buy it?</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={purchaseData.merchant}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, merchant: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="DMart, Amazon, etc."
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Category</label>
                <select
                  value={purchaseData.category}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, category: e.target.value as Category }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseData.date}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Notes (Optional)</label>
                <textarea
                  value={purchaseData.notes}
                  onChange={(e) => setPurchaseData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                  placeholder="Any additional details..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setPurchaseModalItem(null)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePurchase}
                  disabled={isSavingPurchase || !purchaseData.actualPrice || !purchaseData.merchant}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {isSavingPurchase ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Save Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};