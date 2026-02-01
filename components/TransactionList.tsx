import React, { useState, useMemo } from 'react';
import { 
  Receipt, Search, Filter, Calendar, ChevronDown, ChevronUp, Edit3, Trash2, Zap, ShoppingBag,
  X, MapPin, Clock, Tag, Package, TrendingUp, TrendingDown, ArrowUpDown, Store
} from 'lucide-react';
import { ProcessedTransaction, Category } from '../types';
import { processTransaction, formatCurrency, formatDate, formatTime, getCategoryEmoji, getSubcategoryEmoji } from '../utils/transactionUtils';
import { SmartRuleModal } from './SmartRuleModal';

interface TransactionListProps {
  transactions: any[];
  rules: any[];
  userId: string;
  wallets: any[];
  onEditTransaction: (tx: ProcessedTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onCreateRule: (original: string, renamed: string, category?: Category, subcategory?: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  rules,
  onEditTransaction,
  onDeleteTransaction,
  onCreateRule
}) => {
  const [showSmartRuleModal, setShowSmartRuleModal] = useState(false);
  const [selectedTransactionForRule, setSelectedTransactionForRule] = useState<any>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const processedTransactions = transactions.map(tx => processTransaction(tx, rules));

  // Sort and filter transactions
  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = [...processedTransactions];
    
    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(tx => tx.displayCategory === filterCategory);
    }
    
    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(tx => tx.date === filterDate);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.displayCategory.localeCompare(b.displayCategory);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [processedTransactions, sortBy, sortOrder, filterCategory, filterDate]);

  const openSmartRuleModal = (tx: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTransactionForRule(tx);
    setShowSmartRuleModal(true);
  };

  const toggleTransactionDetails = (txId: string) => {
    setExpandedTransactionId(prev => prev === txId ? null : txId);
  };

  const getPreviousTransactions = (tx: ProcessedTransaction) => {
    return processedTransactions.filter(t => 
      t.id !== tx.id && 
      (t.displayMerchant === tx.displayMerchant || 
       (tx.items && tx.items.length > 0 && t.items && t.items.some(item => 
         tx.items?.some(txItem => txItem.name === item.name)
       )))
    ).slice(0, 5);
  };

  const handleEdit = (tx: ProcessedTransaction, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTransaction(tx);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this transaction?')) {
      onDeleteTransaction(id);
    }
  };

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterCategory(prev => prev === category ? null : category);
  };

  const handleDateClick = (date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterDate(prev => prev === date ? null : date);
  };

  if (processedTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center animate-in fade-in duration-500">
         <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
           <ShoppingBag className="w-12 h-12 text-indigo-400 dark:text-indigo-300" />
         </div>
         <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Transactions Yet</h3>
         <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
           Your ledger is clean! Start tracking your expenses by tapping the <span className="font-bold text-indigo-600 dark:text-indigo-400">Add New</span> button in the menu.
         </p>
         <div className="flex gap-2 text-sm text-slate-400 dark:text-slate-500">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">Scan Receipts</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">Auto-Categories</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">Insights</span>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Sorting and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Transactions ({sortedAndFilteredTransactions.length})
          </h2>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Active Filters */}
        {(filterCategory || filterDate) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">Filters:</span>
            {filterCategory && (
              <button
                onClick={() => setFilterCategory(null)}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1"
              >
                {getCategoryEmoji(filterCategory)} {filterCategory}
                <X className="w-3 h-3" />
              </button>
            )}
            {filterDate && (
              <button
                onClick={() => setFilterDate(null)}
                className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" /> {formatDate(filterDate)}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {sortedAndFilteredTransactions.map((tx) => (
          <div key={tx.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Transaction Card */}
            <div 
              onClick={() => toggleTransactionDetails(tx.id)}
              className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-6 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0">
                    <span className="text-3xl">{tx.displayEmoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{tx.displayMerchant}</h3>
                    
                    {/* Category & Subcategory - CLICKABLE */}
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <button
                        onClick={(e) => handleCategoryClick(tx.displayCategory, e)}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        {getCategoryEmoji(tx.displayCategory)} {tx.displayCategory}
                      </button>
                      {tx.displaySubcategory && (
                        <span className="inline-flex items-center px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
                          {getSubcategoryEmoji(tx.displaySubcategory)} {tx.displaySubcategory}
                        </span>
                      )}
                    </div>
                    
                    {/* Items Preview */}
                    {tx.items && tx.items.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <Package className="w-3 h-3" />
                        <span>{tx.items.length} items: {tx.items.slice(0, 3).map(i => i.name).join(', ')}</span>
                        {tx.items.length > 3 && <span>...</span>}
                      </div>
                    )}
                    
                    {/* Location */}
                    {tx.shopLocation && (
                      <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>{tx.shopLocation.shopName}{tx.shopLocation.area && `, ${tx.shopLocation.area}`}</span>
                      </div>
                    )}
                    
                    {/* Date & Time - CLICKABLE DATE */}
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <button
                        onClick={(e) => handleDateClick(tx.date, e)}
                        className="flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tx.date)}</span>
                      </button>
                      {tx.time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{tx.time}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Notes */}
                    {tx.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">{tx.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4 flex flex-col items-end">
                  <div className={`text-2xl font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                  <div className="mt-2">
                    {expandedTransactionId === tx.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-3">
                <button
                  onClick={(e) => handleEdit(tx, e)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => handleDelete(tx.id, e)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => openSmartRuleModal(tx, e)}
                  className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1 group/button"
                  title="Create Smart Rule"
                >
                  <Zap className="w-4 h-4 group-hover/button:rotate-12 transition-transform" />
                  <span className="text-xs font-medium hidden sm:inline">Smart Rule</span>
                </button>
              </div>
            </div>

            {/* Expanded Details - INLINE BELOW TRANSACTION */}
            {expandedTransactionId === tx.id && (
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-6 animate-in slide-in-from-top duration-300">
                {/* Items List */}
                {tx.items && tx.items.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>Items Purchased ({tx.items.length})</span>
                    </div>
                    <div className="space-y-2">
                      {tx.items.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-slate-800 dark:text-white">{item.name}</div>
                              {item.brand && <div className="text-xs text-slate-500 dark:text-slate-400">Brand: {item.brand}</div>}
                              <div className="flex items-center space-x-3 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                {item.quantity && <span>Qty: {item.quantity}</span>}
                                {item.weight && item.weightUnit && <span>Weight: {item.weight}{item.weightUnit}</span>}
                                {item.pricePerUnit && <span>₹{item.pricePerUnit}/unit</span>}
                              </div>
                              {item.mrp && item.price && item.mrp > item.price && (
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                  Saved ₹{(item.mrp - item.price).toFixed(2)} (MRP: ₹{item.mrp})
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-800 dark:text-white">₹{item.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Transactions */}
                {getPreviousTransactions(tx).length > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Previous Transactions</div>
                    <div className="space-y-2">
                      {getPreviousTransactions(tx).map((prevTx) => (
                        <div key={prevTx.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between text-sm border border-slate-100 dark:border-slate-700">
                          <div>
                            <div className="font-medium text-slate-800 dark:text-white">{prevTx.displayMerchant}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(prevTx.date)}</div>
                          </div>
                          <div className="font-bold text-slate-800 dark:text-white">{formatCurrency(prevTx.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Smart Rule Modal */}
      <SmartRuleModal
        isOpen={showSmartRuleModal}
        transaction={selectedTransactionForRule}
        onClose={() => {
          setShowSmartRuleModal(false);
          setSelectedTransactionForRule(null);
        }}
        onCreateRule={onCreateRule}
      />
    </div>
  );
};