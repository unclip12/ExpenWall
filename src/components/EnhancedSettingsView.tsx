import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Zap, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  Sparkles,
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
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
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
        setGeminiApiKey(profile.geminiApiKey || '');
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
        geminiApiKey: selectedProvider === 'gemini' ? geminiApiKey : undefined,
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
    // TODO: Implement API connection test
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

        {/* Gemini API Key */}
        {selectedProvider === 'gemini' && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-blue-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-200 mb-3">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-bold">Google Gemini Configuration</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-24 border border-indigo-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Get your free API key from{' '}
                <a 
                  href="https://aistudio.google.com/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Model</div>
                <div className="font-bold text-slate-800 dark:text-white">Gemini 2.0 Flash</div>
              </div>
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Features</div>
                <div className="font-bold text-slate-800 dark:text-white">Vision + Text</div>
              </div>
            </div>
          </div>
        )}

        {/* Groq API Key */}
        {selectedProvider === 'groq' && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-orange-200 dark:border-slate-600">
            <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200 mb-3">
              <Zap className="w-6 h-6" />
              <h3 className="text-lg font-bold">Groq Configuration</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-4 py-3 pr-24 border border-orange-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {showGroqKey ? (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Get your free API key from{' '}
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                >
                  Groq Console
                </a>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Model</div>
                <div className="font-bold text-slate-800 dark:text-white">Llama 3.3 70B</div>
              </div>
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Speed</div>
                <div className="font-bold text-slate-800 dark:text-white">⚡ Lightning Fast</div>
              </div>
            </div>
          </div>
        )}

        {/* Local/Offline Mode */}
        {selectedProvider === 'local' && (
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-300 dark:border-slate-600">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Offline Mode</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              AI features will use basic keyword matching without external API calls. 
              Receipt scanning and smart categorization will be limited.
            </p>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ <strong>Limited functionality:</strong> Manual entry recommended for best accuracy.
              </p>
            </div>
          </div>
        )}

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
            disabled={isSaving || (selectedProvider === 'gemini' && !geminiApiKey) || (selectedProvider === 'groq' && !groqApiKey)}
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
