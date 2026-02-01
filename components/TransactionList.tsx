import React, { useState } from 'react';
import { 
  Receipt, Search, Filter, Calendar, ChevronDown, ChevronUp, Edit3, Trash2, Zap, ShoppingBag 
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

  const processedTransactions = transactions.map(tx => processTransaction(tx, rules));

  const openSmartRuleModal = (tx: any) => {
    setSelectedTransactionForRule(tx);
    setShowSmartRuleModal(true);
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
      {/* Transactions List */}
      <div className="space-y-4">
        {processedTransactions.map((tx) => (
          <div key={tx.id} className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                  <span className="text-2xl">{tx.displayEmoji}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{tx.displayMerchant}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>{getCategoryEmoji(tx.displayCategory)}{tx.displayCategory}</span>
                    {tx.displaySubcategory && (
                      <>
                        <span>•</span>
                        <span>{getSubcategoryEmoji(tx.displaySubcategory)}{tx.displaySubcategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(tx.amount)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatDate(tx.date)} • {formatTime(tx.date)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all pt-2 border-t border-slate-50 dark:border-slate-700/50 mt-2">
              <button
                onClick={() => onEditTransaction(tx)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDeleteTransaction(tx.id)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl transition-colors text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => openSmartRuleModal(tx)}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1 group/button"
                title="Create Smart Rule (Auto-rename & categorize future transactions)"
              >
                <Zap className="w-4 h-4 group-hover/button:rotate-12 transition-transform" />
                <span className="text-xs font-medium hidden sm:inline">Smart Rule</span>
              </button>
            </div>
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