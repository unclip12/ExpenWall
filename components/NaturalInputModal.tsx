import React, { useState } from 'react';
import { X, Send, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Category } from '../types';

interface NaturalInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    merchant: string;
    amount: number;
    category: Category;
    type: 'expense' | 'income';
    date: string;
  }) => void;
}

export const NaturalInputModal: React.FC<NaturalInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setError(null);
    setParsedData(null);

    try {
      const result = await geminiService.parseNaturalLanguage(input);
      setParsedData(result);
    } catch (err: any) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse. Try rephrasing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onSubmit({
        merchant: parsedData.merchant,
        amount: parsedData.amount,
        category: parsedData.category as Category,
        type: parsedData.type,
        date: parsedData.date,
      });
      onClose();
      setInput('');
      setParsedData(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!parsedData) {
        handleParse();
      } else {
        handleConfirm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quick Add with AI</h3>
                <p className="text-sm text-indigo-100">Just type naturally!</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Examples */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-2">Examples:</p>
            <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
              <li>• "Spent 500 on groceries at DMart"</li>
              <li>• "Paid 200 for Uber yesterday"</li>
              <li>• "Got salary 50000"</li>
              <li>• "Coffee at Starbucks 150"</li>
            </ul>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your transaction..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3}
              disabled={isProcessing}
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {parsedData && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Parsed Successfully!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Merchant:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{parsedData.merchant}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                    <p className="font-bold text-slate-800 dark:text-white">₹{parsedData.amount}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Category:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{parsedData.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Date:</span>
                    <p className="font-bold text-slate-800 dark:text-white">{parsedData.date}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {!parsedData ? (
              <button
                onClick={handleParse}
                disabled={isProcessing || !input.trim()}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Parse with AI</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setInput('');
                  }}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm & Add</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};