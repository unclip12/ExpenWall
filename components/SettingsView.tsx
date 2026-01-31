import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Globe, ChevronDown, Check, Search, Key, ExternalLink, Loader2, Wallet, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { saveUserApiKey, addWalletToDb, deleteWalletFromDb, subscribeToWallets } from '../services/firestoreService';
import { Wallet as WalletType } from '../types';

interface SettingsViewProps {
  currentApiKey?: string;
  onApiKeyUpdate?: (key: string) => void;
  userId?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentApiKey = '', onApiKeyUpdate, userId }) => {
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Wallet State
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<WalletType['type']>('bank');
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);

  // Currency Dropdown
  const [isCurrencyListOpen, setIsCurrencyListOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Separate effects for clarity and correct cleanup
  useEffect(() => {
    const saved = localStorage.getItem('expenwall_currency');
    if (saved) setCurrencyCode(saved);
  }, []);

  useEffect(() => {
    if (currentApiKey) setApiKeyInput(currentApiKey);
  }, [currentApiKey]);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToWallets(userId, setWallets);
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveApiKey = async () => {
    if (!userId) return;
    setIsSavingKey(true);
    try {
      const cleanedKey = apiKeyInput.trim();
      await saveUserApiKey(userId, cleanedKey);
      onApiKeyUpdate?.(cleanedKey);
      showMessage('success', 'API Key saved successfully!');
    } catch {
      showMessage('error', 'Failed to save API Key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newWalletName.trim()) return;
    setIsAddingWallet(true);
    try {
      await addWalletToDb({ name: newWalletName.trim(), type: newWalletType, userId }, userId);
      setNewWalletName('');
      showMessage('success', 'Wallet added!');
    } catch {
      showMessage('error', 'Failed to add wallet.');
    } finally {
      setIsAddingWallet(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Delete this wallet? Linked transactions will remain but lose the wallet reference.')) return;
    setDeletingWalletId(id);
    try {
      await deleteWalletFromDb(id);
    } catch {
      showMessage('error', 'Failed to delete wallet.');
    } finally {
      setDeletingWalletId(null);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-5 h-5 text-emerald-500" />;
      case 'credit': return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'digital': return <Smartphone className="w-5 h-5 text-blue-500" />;
      default: return <Wallet className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-xl shadow-lg border backdrop-blur-xl ${
          message.type === 'success'
            ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
            : 'bg-red-50/90 border-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Wallet Management */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100/50 rounded-2xl text-indigo-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Wallets</h2>
            <p className="text-sm text-slate-500">Manage sources of funds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add New */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Add New Wallet</h3>
            <form onSubmit={handleAddWallet} className="space-y-3">
              <input
                type="text"
                placeholder="Wallet Name (e.g. HDFC Credit)"
                value={newWalletName}
                onChange={e => setNewWalletName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <div className="flex gap-2">
                {(['bank', 'cash', 'credit', 'digital'] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setNewWalletType(type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      newWalletType === type
                        ? 'bg-indigo-600 text-white shadow-md scale-105'
                        : 'bg-white/50 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!newWalletName.trim() || isAddingWallet}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                {isAddingWallet
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <span className="flex items-center"><Plus className="w-5 h-5 mr-2" />Create Wallet</span>
                }
              </button>
            </form>
          </div>

          {/* Wallet List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Wallets</h3>
            {wallets.length === 0 ? (
              <div className="text-center p-6 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No wallets added yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {wallets.map(wallet => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getWalletIcon(wallet.type)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{wallet.name}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{wallet.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteWallet(wallet.id)}
                      disabled={deletingWalletId === wallet.id}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingWalletId === wallet.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100/50 rounded-2xl text-indigo-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Preferences</h2>
            <p className="text-sm text-slate-500">Currency & Defaults</p>
          </div>
        </div>

        <div className="max-w-md relative" ref={dropdownRef}>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Default Currency</label>
          <button
            type="button"
            onClick={() => setIsCurrencyListOpen(!isCurrencyListOpen)}
            className="w-full flex items-center justify-between p-4 bg-white/50 border border-slate-200 rounded-xl hover:border-indigo-500 transition-all text-left backdrop-blur-sm"
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

          {isCurrencyListOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-100 bg-slate-50/80 sticky top-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search currencies..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrencyCode(c.code);
                      localStorage.setItem('expenwall_currency', c.code);
                      setIsCurrencyListOpen(false);
                      setCurrencySearch('');
                      showMessage('success', `Currency updated to ${c.code}`);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors ${currencyCode === c.code ? 'bg-indigo-50/80' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{c.flag}</span>
                      <p className={`text-sm font-medium ${currencyCode === c.code ? 'text-indigo-700' : 'text-slate-700'}`}>{c.name}</p>
                    </div>
                    {currencyCode === c.code && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100/50 rounded-2xl text-indigo-600">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Configuration</h2>
            <p className="text-sm text-slate-500">Gemini API Key</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-4">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
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

          <div className="flex space-x-3">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste Key"
              className="flex-1 px-4 py-3 bg-white/50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={isSavingKey}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
            >
              {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};