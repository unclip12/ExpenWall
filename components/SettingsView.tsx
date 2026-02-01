import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Palette, Moon, Sun, Monitor, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { CURRENCIES, DEFAULT_CURRENCY, THEME_OPTIONS } from '../constants';
import { getUserProfile, saveUserApiKey, saveUserTheme, subscribeToWallets, addWalletToDb, deleteWalletFromDb } from '../services/firestoreService';
import { Wallet, WalletType } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsViewProps {
  userId: string;
  onApiKeyChange: (key: string) => void;
  // Props from previous version compatibility (if needed)
  currentApiKey?: string;
  onApiKeyUpdate?: (key: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userId, onApiKeyChange, currentApiKey, onApiKeyUpdate }) => {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [newWallet, setNewWallet] = useState({ name: '', type: 'bank' as WalletType });
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  useEffect(() => {
    loadSettings();
    const unsub = subscribeToWallets(userId, setWallets);
    return () => unsub();
  }, [userId]);

  const loadSettings = async () => {
    const profile = await getUserProfile(userId);
    if (profile?.apiKey) {
      setApiKey(profile.apiKey);
      onApiKeyChange(profile.apiKey);
      if (onApiKeyUpdate) onApiKeyUpdate(profile.apiKey);
    }
    
    const savedCurrency = localStorage.getItem('expenwall_currency');
    if (savedCurrency) setCurrency(savedCurrency);
  };

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveUserApiKey(userId, apiKey);
      onApiKeyChange(apiKey);
      if (onApiKeyUpdate) onApiKeyUpdate(apiKey);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCurrency = () => {
    localStorage.setItem('expenwall_currency', currency);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as any);
    await saveUserTheme(userId, newTheme);
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet.name.trim()) return;

    setIsAddingWallet(true);
    try {
      await addWalletToDb(newWallet, userId);
      setNewWallet({ name: '', type: 'bank' });
    } catch (error) {
      console.error('Failed to add wallet:', error);
    } finally {
      setIsAddingWallet(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Delete this wallet?')) return;
    await deleteWalletFromDb(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Settings</h2>
            <p className="text-slate-300">Customize your experience</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center space-x-2 animate-in slide-in-from-top duration-300">
          <Save className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Settings saved successfully!</span>
        </div>
      )}

      {/* Theme Settings */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Theme Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {option.value === 'light' && <Sun className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
                    {option.value === 'dark' && <Moon className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
                    {option.value === 'system' && <Monitor className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Currency</h3>
        </div>
        
        <div className="space-y-4">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.symbol})
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSaveCurrency}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>Save Currency</span>
          </button>
        </div>
      </div>

      {/* API Key Settings */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gemini API Key</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              Required for AI-powered receipt scanning and natural language input.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Get your free API key →
            </a>
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button
            onClick={handleSaveApiKey}
            disabled={isSaving || !apiKey}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Save API Key</span>
          </button>
        </div>
      </div>

      {/* Wallet Management */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Wallets</h3>
        </div>

        <form onSubmit={handleAddWallet} className="space-y-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newWallet.name}
              onChange={(e) => setNewWallet(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Wallet name"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={newWallet.type}
              onChange={(e) => setNewWallet(prev => ({ ...prev, type: e.target.value as WalletType }))}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
              <option value="digital">Digital Wallet</option>
            </select>
            <button
              type="submit"
              disabled={isAddingWallet}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isAddingWallet ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {wallets.map(wallet => (
            <div key={wallet.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{wallet.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{wallet.type}</p>
              </div>
              <button
                onClick={() => handleDeleteWallet(wallet.id)}
                className="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {wallets.length === 0 && (
            <p className="text-center text-slate-400 dark:text-slate-500 py-8">No wallets added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};