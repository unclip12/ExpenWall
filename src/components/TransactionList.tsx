import React, { useState } from 'react';
import { 
  Receipt, Search, Filter, Calendar, ChevronDown, ChevronUp, Edit3, Trash2, Zap 
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

  return (
    <div className="space-y-6">
      {/* Transactions List */}
      <div className="space-y-4">
        {processedTransactions.map((tx) => (
          <div key={tx.id} className="group bg-white hover:bg-slate-50 p-6 rounded-2xl shadow-sm border hover:border-indigo-200 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">{tx.displayEmoji}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tx.displayMerchant}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
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
                <div className={`text-2xl font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatCurrency(tx.amount)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatDate(tx.date)} • {formatTime(tx.date)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => onEditTransaction(tx)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDeleteTransaction(tx.id)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-red-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => openSmartRuleModal(tx)}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center space-x-1 group/button"
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