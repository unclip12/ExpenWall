import React, { useRef } from 'react';
import { Bot, Send, Image as ImageIcon, Loader2, Check, X, Edit2, RotateCcw } from 'lucide-react';
import { CATEGORIES, DEFAULT_CURRENCY } from '../constants';
import { Category, Transaction, DraftTransaction, AnalyzerState } from '../types';
import { GEMINI_MODEL } from '../services/geminiService';

interface AnalyzerViewProps {
  apiKey?: string;
  state: AnalyzerState;
  onStateChange: (newState: Partial<AnalyzerState>) => void;
  onSaveTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  onAnalyzeImage: (file: File) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ 
  apiKey, 
  state, 
  onStateChange,
  onSaveTransactions, 
  onAnalyzeImage,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const handleTextSubmit = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    await onSendMessage(text);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAnalyzeImage(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDraft = (id: string) => {
    const newDrafts = state.drafts.filter(d => d.id !== id);
    onStateChange({ drafts: newDrafts });
  };

  const updateDraft = (id: string, field: keyof DraftTransaction, value: any) => {
    const newDrafts = state.drafts.map(d => d.id === id ? { ...d, [field]: value } : d);
    onStateChange({ drafts: newDrafts });
  };

  const handleSaveAll = async () => {
    if (state.drafts.length === 0) return;
    
    const toSave: Omit<Transaction, 'id'>[] = state.drafts.map(d => ({
        merchant: d.merchant,
        date: d.date,
        amount: d.amount,
        type: d.type,
        category: Object.values(Category).includes(d.category as Category) ? d.category as Category : Category.OTHER,
        currency: currency,
        items: [] 
    }));

    await onSaveTransactions(toSave);
  };

  const handleClear = () => {
    if (confirm("Clear all messages and drafts?")) {
        onStateChange({ 
            messages: [{ role: 'bot', text: 'Hello! Upload a bank statement image, or paste transaction JSON.' }], 
            drafts: [] 
        });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      
      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="hidden md:flex items-center px-2 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-500 font-mono border border-slate-200">
           {GEMINI_MODEL}
        </div>
        <button onClick={handleClear} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {state.messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {state.isProcessing && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
               <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
               <span className="text-sm text-slate-500">Processing with Gemini AI...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Drafts Review Area */}
      {state.drafts.length > 0 && (
        <div className="h-64 border-t border-slate-200 flex flex-col bg-white">
          <div className="p-2 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center px-4">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Review Drafts ({state.drafts.length})</span>
            </div>
            <button 
              onClick={handleSaveAll}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium flex items-center shadow-sm"
            >
              <Check className="w-3 h-3 mr-1" />
              Save All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {state.drafts.map((draft) => (
                <div key={draft.id} className="flex flex-col md:flex-row gap-2 p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-indigo-200 transition-colors">
                   <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input 
                        value={draft.merchant}
                        onChange={(e) => updateDraft(draft.id, 'merchant', e.target.value)}
                        className="text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none"
                      />
                      <input 
                        type="date"
                        value={draft.date}
                        onChange={(e) => updateDraft(draft.id, 'date', e.target.value)}
                        className="text-xs text-slate-500 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none"
                      />
                      <select
                        value={draft.category}
                        onChange={(e) => updateDraft(draft.id, 'category', e.target.value)}
                        className="text-xs text-slate-600 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none"
                      >
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="flex items-center space-x-1">
                         <select 
                           value={draft.type}
                           onChange={(e) => updateDraft(draft.id, 'type', e.target.value)}
                           className={`text-xs font-bold uppercase border-none outline-none bg-transparent ${draft.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}
                         >
                            <option value="expense">EXP</option>
                            <option value="income">INC</option>
                         </select>
                         <input 
                           type="number"
                           value={draft.amount}
                           onChange={(e) => updateDraft(draft.id, 'amount', parseFloat(e.target.value))}
                           className="w-20 text-sm font-mono text-right border-b border-transparent focus:border-indigo-300 outline-none"
                         />
                      </div>
                   </div>
                   <button onClick={() => removeDraft(draft.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <X className="w-4 h-4" />
                   </button>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center space-x-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors relative group"
            title="Upload Statement Image"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Scan Image (AI)
            </span>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
              placeholder={state.drafts.length > 0 ? "Type to correct drafts (AI Mode)..." : "Paste transaction JSON or chat..."}
              className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-[50px] text-sm ${
                  state.drafts.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}
            />
          </div>
          
          <button 
            onClick={handleTextSubmit}
            disabled={!inputValue.trim() || state.isProcessing}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {state.drafts.length > 0 ? <Bot className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex justify-between px-1">
           {state.drafts.length > 0 ? (
               <span className="text-indigo-500 font-medium flex items-center">
                   <Bot className="w-3 h-3 mr-1"/>
                   AI Correction Mode: Chat to fix mistakes (e.g. "Change IDFC to Transport")
               </span>
           ) : (
               <span>Paste JSON for Local Mode, or Upload Image for AI Mode</span>
           )}
        </div>
      </div>
    </div>
  );
};