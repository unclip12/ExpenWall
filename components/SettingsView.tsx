import React, { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, AlertCircle, Globe, ChevronDown, Check, Search, Key, ExternalLink, Loader2 } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { saveUserApiKey } from '../services/firestoreService';

interface SettingsViewProps {
  currentApiKey?: string;
  onApiKeyUpdate?: (key: string) => void;
  userId?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentApiKey = '', onApiKeyUpdate, userId }) => {
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Dropdown state
  const [isCurrencyListOpen, setIsCurrencyListOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing currency preference
    const savedCurrency = localStorage.getItem('expenwall_currency');
    if (savedCurrency) {
      setCurrencyCode(savedCurrency);
    }
    // Sync prop to state if it loads late
    if (currentApiKey) {
      setApiKeyInput(currentApiKey);
    }

    // Click outside handler for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, [currentApiKey]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveApiKey = async () => {
    if (!userId) {
      showMessage('error', 'User not authenticated.');
      return;
    }

    setIsSavingKey(true);
    try {
      const cleanedKey = apiKeyInput.trim();
      await saveUserApiKey(userId, cleanedKey);
      if (onApiKeyUpdate) onApiKeyUpdate(cleanedKey);
      showMessage('success', 'API Key saved successfully!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'Failed to save API Key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) || 
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Feedback Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* API Key Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Key className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gemini AI Configuration</h2>
            <p className="text-sm text-slate-500">Enable receipt scanning with your own AI key</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-4">
           <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-sm text-blue-800 mb-2">
                To use the AI receipt scanner, you need a Google Gemini API Key. It's free to generate.
              </p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Get your free API Key here
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Your Gemini API Key</label>
              <div className="flex space-x-3">
                <input 
                  type="password" 
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your AI Studio API Key here"
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[100px] justify-center"
                >
                  {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Key'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Your key is encrypted and stored securely with your Secret ID profile. We never share it.
              </p>
           </div>
        </div>
      </div>

      {/* App Preferences Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Globe className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">App Preferences</h2>
            <p className="text-sm text-slate-500">Customize your default experience</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Default Currency</label>
             
             {/* Custom Dropdown */}
             <div className="relative" ref={dropdownRef}>
               {/* Selected State (Click to open) */}
               <button
                 type="button"
                 onClick={() => setIsCurrencyListOpen(!isCurrencyListOpen)}
                 className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 transition-all text-left"
               >
                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">{selectedCurrency.flag}</span>
                   <div>
                     <p className="font-bold text-slate-800">{selectedCurrency.name}</p>
                     <p className="text-xs text-slate-500">{selectedCurrency.code} ({selectedCurrency.symbol})</p>
                   </div>
                 </div>
                 <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCurrencyListOpen ? 'rotate-180' : ''}`} />
               </button>

               {/* Dropdown List */}
               {isCurrencyListOpen && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                   {/* Search Bar */}
                   <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0">
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input
                         type="text"
                         autoFocus
                         placeholder="Search countries..."
                         value={currencySearch}
                         onChange={(e) => setCurrencySearch(e.target.value)}
                         className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                       />
                     </div>
                   </div>
                   
                   {/* Scrollable List */}
                   <div className="max-h-64 overflow-y-auto">
                     {filteredCurrencies.length > 0 ? (
                       filteredCurrencies.map((c) => (
                         <button
                           key={c.code}
                           onClick={() => {
                             const newCode = c.code;
                             setCurrencyCode(newCode);
                             localStorage.setItem('expenwall_currency', newCode);
                             setIsCurrencyListOpen(false);
                             setCurrencySearch('');
                             showMessage('success', `Currency updated to ${newCode}`);
                           }}
                           className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${
                             currencyCode === c.code ? 'bg-indigo-50/50' : ''
                           }`}
                         >
                           <div className="flex items-center space-x-3">
                             <span className="text-xl">{c.flag}</span>
                             <div className="text-left">
                               <p className={`text-sm font-medium ${currencyCode === c.code ? 'text-indigo-700' : 'text-slate-700'}`}>
                                 {c.name}
                               </p>
                               <p className="text-xs text-slate-500">{c.code}</p>
                             </div>
                           </div>
                           {currencyCode === c.code && <Check className="w-4 h-4 text-indigo-600" />}
                         </button>
                       ))
                     ) : (
                       <div className="p-4 text-center text-sm text-slate-500">No currency found.</div>
                     )}
                   </div>
                 </div>
               )}
             </div>

             <p className="text-xs text-slate-500">This currency will be selected by default when adding transactions or viewing the dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};