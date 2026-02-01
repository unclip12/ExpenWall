import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle, 
  Edit3, 
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { ProcessedTransaction, Category } from '../types';
import { getSubcategorySuggestions, getCategoryEmoji } from '../utils/transactionUtils';
import { CATEGORIES } from '../constants';

interface SmartRuleModalProps {
  isOpen: boolean;
  transaction: ProcessedTransaction | null;
  onClose: () => void;
  onCreateRule: (original: string, renamed: string, category?: Category, subcategory?: string) => void;
}

export const SmartRuleModal: React.FC<SmartRuleModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onCreateRule
}) => {
  const [newMerchantName, setNewMerchantName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategorySuggestions, setSubcategorySuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (transaction) {
      setNewMerchantName(transaction.displayMerchant);
      setSelectedCategory(transaction.displayCategory);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction && newMerchantName.trim() && newMerchantName !== transaction.merchant) {
      onCreateRule(transaction.merchant, newMerchantName.trim(), selectedCategory || undefined, selectedSubcategory || undefined);
    }
    onClose();
  };

  const handleSubcategoryChange = (subcat: string) => {
    setSelectedSubcategory(subcat);
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 max-w-md w-full mx-4 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-2xl">
                <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Create Smart Rule
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically rename and categorize future "{transaction.merchant}" transactions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Merchant Rename */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              New Merchant Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={newMerchantName}
                onChange={(e) => setNewMerchantName(e.target.value)}
                placeholder="e.g. FASTag instead of IDFC FastTag"
                className="w-full px-4 py-3 pl-12 border border-slate-200 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
              <span className="absolute left-4 top-3.5 text-slate-400">
                {transaction.displayEmoji}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Original: <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">{transaction.merchant}</span>
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  {selectedCategory ? (
                    <>
                      <span>{getCategoryEmoji(selectedCategory)}</span>
                      <span>{selectedCategory}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Select category...</span>
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {categoryOpen && (
                <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat as Category);
                        setCategoryOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors"
                    >
                      <span>{getCategoryEmoji(cat as Category)}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subcategory (Optional) */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  // Auto-suggest
                  const suggestions = getSubcategorySuggestions(e.target.value);
                  setSubcategorySuggestions(suggestions);
                }}
                placeholder="Type for suggestions..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              {/* Suggestions */}
              {subcategorySuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {subcategorySuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSubcategoryChange(suggestion.subcategory)}
                      className="w-full flex items-center space-x-2 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-xl transition-colors text-left text-sm"
                    >
                      <span>{suggestion.emoji}</span>
                      <span>{suggestion.subcategory}</span>
                      <span className="ml-auto text-xs text-slate-400">({suggestion.confidence > 0.8 ? 'High confidence' : 'Good match'})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newMerchantName || newMerchantName === transaction.merchant}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5" />
              <span>Create Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};