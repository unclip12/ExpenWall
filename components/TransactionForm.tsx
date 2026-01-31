import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, Check, Loader2, X, AlertCircle, Settings, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Category, Transaction, ReceiptData } from '../types';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { geminiService } from '../services/geminiService';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  apiKey?: string;
  onOpenSettings?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, apiKey, onOpenSettings }) => {
  // Initialize form with preferred currency
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY,
    category: Category.OTHER,
    type: 'expense', // Default to expense
    notes: '',
    items: [],
    receiptUrl: ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Two separate refs for different input behaviors
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
    // Clear error if user starts typing manually
    if (scanError) setScanError(null);
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
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        try {
          const receiptData: ReceiptData = await geminiService.processReceiptImage(base64Data, mimeType, apiKey);
          
          let detectedCurrency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
          
          // Only override default currency if the receipt explicitly looks like another supported currency
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
            type: 'expense', // Receipts are usually expenses
            receiptUrl: base64String // Kept in state for preview, but removed on submit
          }));
        } catch (err: any) {
            console.error("Receipt scanning error:", err);
            setScanError(err.message || "Failed to extract data. Please enter details manually.");
        } finally {
          setIsScanning(false);
          // Reset input value so same file can be selected again if needed
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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
          <p className="text-sm text-slate-500">Fill in details or upload a receipt</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
           <button
             type="button"
             onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
             className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition-all ${
               formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <ArrowUpCircle className="w-4 h-4" />
             <span>Expense</span>
           </button>
           <button
             type="button"
             onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: Category.INCOME }))}
             className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition-all ${
               formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <ArrowDownCircle className="w-4 h-4" />
             <span>Income</span>
           </button>
        </div>

        {/* File Upload Section (Only show for expenses typically, but allow for both) */}
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center transition-all hover:bg-indigo-100/50">
          
          {!apiKey ? (
             <div className="flex flex-col items-center justify-center space-y-3">
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
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-indigo-700">Analyzing Receipt with Gemini AI...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center space-x-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </button>
                  </div>
                  <p className="text-xs text-indigo-400">Supports JPG, PNG, WEBP. AI will auto-fill the form.</p>
                  
                  {scanError && (
                    <div className="flex flex-col items-center space-y-2 max-w-md mx-auto">
                        <div className="flex items-start justify-center space-x-2 text-red-500 font-medium bg-red-50 p-2 rounded-lg border border-red-100 w-full">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-left break-words">{scanError}</p>
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
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-sm font-medium"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium">{selectedCurrencySymbol}</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:border-transparent outline-none transition-all ${
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
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Add any additional details here..."
            />
          </div>

          {formData.items && formData.items.length > 0 && formData.type === 'expense' && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
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
              className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all flex items-center ${
                  formData.type === 'income' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <Check className="w-4 h-4 mr-2" />
              Save {formData.type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};