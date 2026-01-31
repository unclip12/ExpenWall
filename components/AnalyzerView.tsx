import React, { useState, useRef } from 'react';
import { Bot, Send, Image as ImageIcon, Loader2, Check, X, Edit2, Copy, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CATEGORIES, DEFAULT_CURRENCY } from '../constants';
import { Category, Transaction } from '../types';

interface AnalyzerViewProps {
  apiKey?: string;
  onSaveTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
}

interface DraftTransaction {
  id: string; // Temp ID
  merchant: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ apiKey, onSaveTransactions }) => {
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! I can analyze your bank statements. Upload an image, or paste the JSON result from an external AI if you want to save API costs.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [drafts, setDrafts] = useState<DraftTransaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;

  // Handle parsing of pasted JSON
  const handleTextSubmit = async () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // 1. Attempt to parse as JSON first (User pasted external AI result)
      // Remove potential markdown wrappers
      const cleanText = text.replace(/```json|```/g, '').trim();
      if (cleanText.startsWith('[') || cleanText.startsWith('{')) {
         try {
             let parsed = JSON.parse(cleanText);
             // Normalize to array
             if (!Array.isArray(parsed) && parsed.transactions) parsed = parsed.transactions;
             if (!Array.isArray(parsed)) parsed = [parsed];

             processDrafts(parsed);
             setMessages(prev => [...prev, { role: 'bot', text: `I found ${parsed.length} transactions in your pasted text. Review them below.` }]);
             setIsProcessing(false);
             return;
         } catch (e) {
             // Fall through to normal message if not JSON
         }
      }

      // 2. If not JSON, it's a chat message. Analyzer primarily works with Images or JSON.
      setMessages(prev => [...prev, { role: 'bot', text: "I'm primarily designed to read JSON or Images. If you are chatting, please note I can't answer general questions yet." }]);
      
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that text." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'bot', text: "Please configure your API Key in Settings to use the Image Scanner." }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: "Analyzing uploaded image..." }]);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        try {
          const result = await geminiService.analyzeBankStatement(base64Data, file.type, apiKey);
          if (result.transactions && result.transactions.length > 0) {
             processDrafts(result.transactions);
             setMessages(prev => [...prev, { role: 'bot', text: `Success! I extracted ${result.transactions.length} transactions. Please review and save them.` }]);
          } else {
             setMessages(prev => [...prev, { role: 'bot', text: "I couldn't find any clear transactions in that image." }]);
          }
        } catch (apiError: any) {
           setMessages(prev => [...prev, { role: 'bot', text: `Error: ${apiError.message}` }]);
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
       setIsProcessing(false);
       setMessages(prev => [...prev, { role: 'bot', text: "Error reading file." }]);
    }
  };

  const processDrafts = (rawTransactions: any[]) => {
      const newDrafts: DraftTransaction[] = rawTransactions.map((t, idx) => ({
          id: `temp-${Date.now()}-${idx}`,
          merchant: t.merchant || "Unknown",
          date: t.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(t.amount) || 0,
          type: (t.type === 'income' || t.type === 'credit') ? 'income' : 'expense',
          category: t.category || Category.OTHER
      }));
      setDrafts(prev => [...prev, ...newDrafts]);
  };

  const removeDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const updateDraft = (id: string, field: keyof DraftTransaction, value: any) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleSaveAll = async () => {
    if (drafts.length === 0) return;
    
    // Convert drafts to final Transaction format
    const toSave: Omit<Transaction, 'id'>[] = drafts.map(d => ({
        merchant: d.merchant,
        date: d.date,
        amount: d.amount,
        type: d.type,
        category: Object.values(Category).includes(d.category as Category) ? d.category as Category : Category.OTHER,
        currency: currency,
        items: [] // Bulk statements usually don't have item details
    }));

    await onSaveTransactions(toSave);
    setDrafts([]);
    setMessages(prev => [...prev, { role: 'bot', text: `Saved ${toSave.length} transactions to your dashboard!` }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
               <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
               <span className="text-sm text-slate-500">Processing...</span>
             </div>
           </div>
        )}
      </div>

      {/* Drafts Review Area (Only visible if drafts exist) */}
      {drafts.length > 0 && (
        <div className="h-64 border-t border-slate-200 flex flex-col bg-white">
          <div className="p-2 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center px-4">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Review Drafts ({drafts.length})</span>
            <button 
              onClick={handleSaveAll}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium flex items-center"
            >
              <Check className="w-3 h-3 mr-1" />
              Save All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {drafts.map((draft) => (
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
            className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            title="Upload Statement Image"
          >
            <ImageIcon className="w-5 h-5" />
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
              placeholder="Paste JSON here, or type a message..."
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-[50px] text-sm"
            />
          </div>
          
          <button 
            onClick={handleTextSubmit}
            disabled={!inputValue.trim() || isProcessing}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex justify-between px-1">
           <span>Use the Gemini App to generate JSON for free and paste it here!</span>
           <span>Image upload uses your API Key</span>
        </div>
      </div>
    </div>
  );
};