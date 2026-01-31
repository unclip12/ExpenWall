import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, Check, Loader2, X, AlertCircle, Settings, ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon, Sparkles } from 'lucide-react';
import { Category, Transaction, ReceiptData, Wallet } from '../types';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { geminiService, GEMINI_MODEL } from '../services/geminiService';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  apiKey?: string;
  onOpenSettings?: () => void;
  wallets?: Wallet[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, apiKey, onOpenSettings, wallets = [] }) => {
  // Initialize form with preferred currency
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY,
    category: Category.OTHER,
    type: 'expense', 
    notes: '',
    items: [],
    receiptUrl: '',
    walletId: wallets.length > 0 ? wallets[0].id : ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
    if (scanError) setScanError(null);
  };

  const parseErrorMessage = (errorMsg: string): string => {
    try {
      // If it looks like JSON, try to parse it
      if (errorMsg.includes('{')) {
        const jsonStart = errorMsg.indexOf('{');
        const jsonStr = errorMsg.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        
        // Google API errors usually follow this structure
        if (parsed.error && parsed.error.message) {
          return parsed.error.message;
        }
        if (parsed.message) {
          return parsed.message;
        }
      }
      return errorMsg;
    } catch (e) {
      return errorMsg;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey) {
      setScanError("Missing API Key");
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        try {
          const receiptData: ReceiptData = await geminiService.processReceiptImage(base64Data, mimeType, apiKey);
          
          let detectedCurrency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
          
          if (receiptData.currency) {
             const cleanCurrency = receiptData.currency.toUpperCase();
             const match = CURRENCIES.find(c => cleanCurrency.includes(c.code) || cleanCurrency.includes(c.symbol));
             if (match) {
                detectedCurrency = match.code;
             }
          }

          setFormData(prev => ({
            ...prev,
            merchant: receiptData.merchant || "Unknown Merchant",
            date: receiptData.date || prev.date,
            amount: receiptData.totalAmount || prev.amount,
            currency: detectedCurrency,
            category: (Object.values(Category).includes(receiptData.category as Category) 
              ? receiptData.category as Category 
              : Category.OTHER),
            items: receiptData.items || [],
            type: 'expense',
            receiptUrl: base64String 
          }));
        } catch (err: any) {
            console.error("Receipt scanning error:", err);
            setScanError(err.message || "Failed to extract data. Please enter details manually.");
        } finally {
          setIsScanning(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanError("Error reading file from device.");
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = { ...formData };
    delete submissionData.receiptUrl;
    onSubmit(submissionData);
  };

  const selectedCurrencySymbol = CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$';

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-6 bg-white/50 border-b border-white/20 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
          <p className="text-sm text-slate-500">Log expense or income</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-200/50 transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl backdrop-blur-sm">
           <button
             type="button"
             onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
             className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${
               formData.type === 'expense' ? 'bg-white text-red-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <ArrowUpCircle className="w-4 h-4" />
             <span>Expense</span>
           </button>
           <button
             type="button"
             onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: Category.INCOME }))}
             className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold transition-all ${
               formData.type === 'income' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <ArrowDownCircle className="w-4 h-4" />
             <span>Income</span>
           </button>
        </div>

        {/* File Upload */}
        <div className="bg-indigo-50/50 border-2 border-dashed border-indigo-200/60 rounded-2xl p-6 text-center transition-all hover:bg-indigo-50 hover:border-indigo-300 relative">
          
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] text-indigo-500 font-medium border border-indigo-100">
             <Sparkles className="w-3 h-3" />
             <span>{GEMINI_MODEL}</span>
          </div>

          {!apiKey ? (
             <div className="flex flex-col items-center justify-center space-y-3 pt-4">
               <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <p className="text-slate-700 font-medium">AI Scanning is not configured</p>
               <button 
                 onClick={onOpenSettings}
                 className="mt-2 flex items-center space-x-2 px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm text-sm font-medium"
               >
                 <Settings className="w-4 h-4" />
                 <span>Configure API Key</span>
               </button>
             </div>
          ) : (
            <>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
              <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              
              {isScanning ? (
                <div className="flex flex-col items-center justify-center space-y-3 pt-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-indigo-700">Analyzing Receipt with Gemini AI...</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-center space-x-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-xl hover:bg-white/80 transition-colors shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </button>
                  </div>
                  <p className="text-xs text-indigo-400">Supports JPG, PNG, WEBP. AI will auto-fill the form.</p>
                  
                  {scanError && (
                    <div className="flex flex-col items-center space-y-2 max-w-md mx-auto w-full">
                        <div className="flex items-start justify-start space-x-3 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 w-full shadow-sm text-left">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold mb-1">Scanning Failed</p>
                                <div className="text-xs break-words font-mono bg-white/50 p-2 rounded border border-red-100/50 max-h-32 overflow-y-auto">
                                  {parseErrorMessage(scanError)}
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Merchant / Source</label>
              <input
                type="text"
                name="merchant"
                required
                value={formData.merchant}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm"
                placeholder="e.g. Starbucks or Salary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Amount</label>
              <div className="flex space-x-2">
                <div className="relative w-28 flex-shrink-0">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-2 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-3.5 text-slate-400 font-medium">{selectedCurrencySymbol}</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm ${
                        formData.type === 'income' ? 'text-emerald-600 font-semibold' : 'text-slate-800'
                    }`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                    {formData.type === 'income' ? 'Destination Wallet' : 'Source Wallet'}
                </label>
                <div className="relative">
                    <WalletIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <select
                        name="walletId"
                        value={formData.walletId}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm appearance-none"
                    >
                        <option value="">Select a Wallet</option>
                        {wallets.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {wallets.length === 0 && (
                     <p className="text-xs text-red-500">No wallets found. Please add one in Settings.</p>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none bg-white/50 backdrop-blur-sm"
              placeholder="Add details..."
            />
          </div>

          {formData.items && formData.items.length > 0 && formData.type === 'expense' && (
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Extracted Items</h4>
              <div className="space-y-2">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-700">
                    <span>{item.name}</span>
                    <span className="font-mono text-slate-500">{selectedCurrencySymbol}{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-3 rounded-xl text-white font-medium shadow-lg transition-all flex items-center transform hover:scale-[1.02] active:scale-[0.98] ${
                  formData.type === 'income' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <Check className="w-5 h-5 mr-2" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChevronDownIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);