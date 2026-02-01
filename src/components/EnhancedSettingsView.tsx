import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  CheckCircle, 
  Cpu,
  Save,
  RefreshCw
} from 'lucide-react';
import { AI_PROVIDERS } from '../constants';
import { getUserProfile, saveUserAISettings } from '../services/firestoreService';

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

  useEffect(() => {
    loadUserSettings();
  }, [userId]);

  const loadUserSettings = async () => {
    try {
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