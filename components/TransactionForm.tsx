import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, Check, Loader2, X, AlertCircle, Settings, ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon, Sparkles, ExternalLink, HelpCircle, FileText } from 'lucide-react';
import { Category, Transaction, ReceiptData, Wallet } from '../types';
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { geminiService, GEMINI_MODEL } from '../services/geminiService';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  apiKey?: string;
  onOpenSettings?: () => void;
  wallets?: Wallet[];
  initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, apiKey, onOpenSettings, wallets = [], initialData }) => {
  // Initialize form with preferred currency
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    merchant: initialData?.merchant ?? '',
    date: initialData?.date ?? new Date().toISOString().split('T')[0],
    amount: initialData?.amount ?? 0,
    currency: initialData?.currency ?? (localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY),
    category: initialData?.category ?? Category.OTHER,
    subcategory: initialData?.subcategory ?? '',
    type: initialData?.type ?? 'expense', 
    notes: initialData?.notes ?? '',
    items: initialData?.items ?? [],
    receiptUrl: initialData?.receiptUrl ?? '',
    walletId: initialData?.walletId ?? (wallets.length > 0 ? wallets[0].id : ''),
    tags: initialData?.tags ?? []
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

  const renderErrorGuide = (errorMsg: string) => {
    const isQuotaError = errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED');
    const isKeyError = errorMsg.includes('403') || errorMsg.toLowerCase().includes('api key') || errorMsg.includes('PERMISSION_DENIED');
    const isNotFoundError = errorMsg.includes('404') || errorMsg.includes('NOT_FOUND');

    let title = "Scanning Error";
    let description = errorMsg;
    let actionLink = "https://ai.google.dev/gemini-api/docs";
    let actionText = "Gemini Docs";

    if (isQuotaError) {
      title = "Quota Exceeded";
      description = "You have reached the free tier limits for the Gemini API.";
      actionLink = "https://aistudio.google.com/app/plan_information";
      actionText = "Check Usage & Billing";
    } else if (isKeyError) {
      title = "Invalid API Key";
      description = "The API Key in settings is incorrect or has expired.";
      actionLink = "https://aistudio.google.com/app/apikey";
      actionText = "Get New API Key";
    } else if (isNotFoundError) {
      title = "Model Not Available";
      description = `The model '${GEMINI_MODEL}' is not available in your region or account type.`;
      actionLink = "https://ai.google.dev/gemini-api/docs/models/gemini";
      actionText = "Check Model Availability";
    }

    let technicalDetails = errorMsg;
    try {
        if (errorMsg.includes('{')) {
            const parsed = JSON.parse(errorMsg.substring(errorMsg.indexOf('{')));
            technicalDetails = parsed.error?.message || parsed.message || errorMsg;
        }
    } catch {}

    return (
      <div className="flex flex-col items-center space-y-3 w-full bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm text-left">
         <div className="flex items-start w-full gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm text-red-500">
               <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <h4 className="text-sm font-bold text-red-800">{title}</h4>
               <p className="text-xs text-red-600 mt-1 mb-2">{description}</p>
               <a 
                 href={actionLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
               >
                 {actionText}
                 <ExternalLink className="w-3 h-3 ml-1" />
               </a>
            </div>
         </div>
         
         <details className="w-full">
            <summary className="text-[10px] text-red-400 cursor-pointer hover:text-red-600 flex items-center gap-1">
               <HelpCircle className="w-3 h-3" /> Show Technical Details
            </summary>
            <div className="mt-2 p-2 bg-white/50 rounded border border-red-100 text-[10px] font-mono text-red-800 break-words max-h-24 overflow-y-auto">
               {technicalDetails}
            </div>
         </details>
      </div>
    );
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
            setScanError(err.message || "Failed to extract data.");
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
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <p className="text-sm text-slate-500">{initialData ? 'Update details' : 'Log expense or income'}</p>
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

        {/* Improved File Upload UI */}
        <div 
          onClick={() => !apiKey ? onOpenSettings?.() : fileInputRef.current?.click()}
          className={`group border-2 border-dashed rounded-2xl p-8 text-center transition-all relative cursor-pointer ${
            isScanning 
              ? 'bg-indigo-50 border-indigo-300' 
              : apiKey 
                ? 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300'
                : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] text-indigo-500 font-bold border border-indigo-100 shadow-sm">
             <Sparkles className="w-3 h-3" />
             <span>AI Auto-Fill</span>
          </div>

          {!apiKey ? (
             <div className="flex flex-col items-center justify-center space-y-3">
               <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                 <AlertCircle className="w-8 h-8" />
               </div>
               <div>
                 <p className="text-slate-800 font-bold">AI Scanner Not Ready</p>
                 <p className="text-sm text-slate-500">Add your API Key in settings to enable receipt scanning.</p>
               </div>
             </div>
          ) : isScanning ? (
             <div className="flex flex-col items-center justify-center space-y-4 py-2">
               <div className="relative">
                 <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-indigo-600" />
                 </div>
               </div>
               <div>
                 <p className="text-indigo-700 font-bold">Analyzing Receipt...</p>
                 <p className="text-xs text-indigo-500">Extracting merchant, date, and items</p>
               </div>
             </div>
          ) : (
             <div className="space-y-4">
               <div className="flex justify-center">
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                   <FileText className="w-8 h-8 text-indigo-500" />
                 </div>
               </div>
               <div>
                 <p className="text-lg font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                   Tap to Upload Bill
                 </p>
                 <p className="text-sm text-slate-400">
                   Supports JPG, PNG • AI Extracts Details
                 </p>
               </div>
               <div className="flex justify-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-semibold shadow-sm border border-slate-200 hover:border-indigo-300 transition-all"
                  >
                    Choose File
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Camera
                  </button>
               </div>
             </div>
          )}

          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </div>
        
        {scanError && renderErrorGuide(scanError)}

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
              {initialData ? 'Update' : 'Save'}
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