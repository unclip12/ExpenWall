import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  CheckCircle, 
  Cpu,
  Save,
  RefreshCw,
  Globe,
  Wallet as WalletIcon,
  Trash2,
  Plus,
  Loader2,
  Database,
  AlertTriangle
} from 'lucide-react';
import { AI_PROVIDERS, CURRENCIES, DEFAULT_CURRENCY, THEME_OPTIONS } from '../constants';
import { getUserProfile, saveUserAISettings, subscribeToWallets, addWalletToDb, deleteWalletFromDb } from '../services/firestoreService';
import { resetAppData, initializeSeedData } from '../services/seedDataService';
import { Wallet, WalletType } from '../types';

interface EnhancedSettingsViewProps {
  userId: string;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const EnhancedSettingsView: React.FC<EnhancedSettingsViewProps> = ({
  userId,
  currentTheme,
  onThemeChange
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq' | 'local'>('gemini');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Currency & Wallet State
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [newWallet, setNewWallet] = useState({ name: '', type: 'bank' as WalletType });
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  // Data Management State
  const [isResetting, setIsResetting] = useState(false);
  const [isReInitializing, setIsReInitializing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReinitConfirm, setShowReinitConfirm] = useState(false);

  useEffect(() => {
    loadUserSettings();
    const unsub = subscribeToWallets(userId, setWallets);
    return () => unsub();
  }, [userId]);

  const loadUserSettings = async () => {
    try {
      const savedCurrency = localStorage.getItem('expenwall_currency');
      if (savedCurrency) setCurrency(savedCurrency);

      const profile = await getUserProfile(userId);
      if (profile) {
        setGroqApiKey(profile.groqApiKey || '');
        setSelectedProvider(profile.aiProvider || 'gemini');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      localStorage.setItem('expenwall_currency', currency);

      await saveUserAISettings(userId, {
        aiProvider: selectedProvider,
        groqApiKey: selectedProvider === 'groq' ? groqApiKey : undefined,
        updatedAt: new Date()
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
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

  const handleResetAppData = async () => {
    setIsResetting(true);
    try {
      await resetAppData(userId);
      alert('✅ App data reset successfully! The page will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset app data:', error);
      alert('❌ Failed to reset app data. Please try again.');
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleReinitializeSeedData = async () => {
    setIsReInitializing(true);
    try {
      // First reset, then reinitialize
      await resetAppData(userId);
      await initializeSeedData(userId);
      alert('✅ Example data reinitialized successfully! The page will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reinitialize seed data:', error);
      alert('❌ Failed to reinitialize data. Please try again.');
    } finally {
      setIsReInitializing(false);
      setShowReinitConfirm(false);
    }
  };

  const testConnection = async () => {
    alert('Testing connection...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
            <Settings className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-xl opacity-90">Customize your ExpenWall experience</p>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Data Management</h3>
        </div>

        <div className="space-y-4">
          {/* Reinitialize Example Data */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Reload Example Data</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reset your app and reload 100+ example transactions with realistic Indian shopping data from DMart, JioMart, Zepto, Flipkart, Amazon, and more.
                </p>
              </div>
            </div>
            {!showReinitConfirm ? (
              <button
                onClick={() => setShowReinitConfirm(true)}
                disabled={isReInitializing}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload Example Data</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> This will delete ALL your current data and reload fresh example data. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReinitializeSeedData}
                    disabled={isReInitializing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    {isReInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Yes, Reload Data</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowReinitConfirm(false)}
                    disabled={isReInitializing}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset All Data */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Reset All Data</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete all your transactions, wallets, budgets, and other data. Use this to start fresh with a clean slate.
                </p>
              </div>
            </div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Reset All Data</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Warning:</strong> This will permanently delete ALL your data including transactions, wallets, budgets, and settings. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAppData}
                    disabled={isResetting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Yes, Delete Everything</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Currency</h3>
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
        </div>
      </div>

      {/* Wallet Management */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <WalletIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Wallets</h3>
        </div>

        <form onSubmit={handleAddWallet} className="space-y-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newWallet.name}
              onChange={(e) => setNewWallet(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Wallet name (e.g. HDFC)"
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
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[50px]"
            >
              {isAddingWallet ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {wallets.map(wallet => (
            <div key={wallet.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                  <WalletIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{wallet.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{wallet.type}</p>
                </div>
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
            <p className="text-center text-slate-400 dark:text-slate-500 py-8 italic">No wallets added yet.</p>
          )}
        </div>
      </div>

      {/* AI Provider Selection */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Provider</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {AI_PROVIDERS.map(provider => (
            <button
              key={provider.value}
              onClick={() => setSelectedProvider(provider.value as any)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedProvider === provider.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {provider.label}
                </h3>
                {selectedProvider === provider.value && (
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {provider.description}
              </p>
              {provider.free && (
                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                  FREE
                </span>
              )}
              {provider.recommended && (
                <span className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold ml-2">
                  ⚡ RECOMMENDED
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={testConnection}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-2xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Test Connection</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
          </div>
        )}
      </div>

      {/* Theme Settings */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          {currentTheme === 'dark' ? (
            <Moon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sun className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          )}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Appearance</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onThemeChange('light')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              currentTheme === 'light'
                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <Sun className="w-10 h-10 mx-auto mb-3 text-amber-500" />
            <div className="font-bold text-slate-800">Light Mode</div>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              currentTheme === 'dark'
                ? 'border-indigo-500 bg-indigo-900/20 shadow-lg'
                : 'border-slate-700 hover:border-indigo-700'
            }`}
          >
            <Moon className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
            <div className="font-bold text-white">Dark Mode</div>
          </button>
        </div>
      </div>
    </div>
  );
};