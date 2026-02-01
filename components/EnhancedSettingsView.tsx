import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { saveUserAISettings } from '../services/firestoreService';

interface EnhancedSettingsViewProps {
  userId: string;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const EnhancedSettingsView: React.FC<EnhancedSettingsViewProps> = ({ userId, currentTheme, onThemeChange }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    await saveUserAISettings(userId, { geminiApiKey: apiKey });
    alert('Settings Saved');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-8 rounded-3xl text-white shadow-lg flex items-center gap-4">
        <Settings className="w-10 h-10" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
        <h3 className="font-bold mb-4 dark:text-white">API Configuration</h3>
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Gemini API Key" className="w-full p-3 border rounded-xl mb-4 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow">
        <h3 className="font-bold mb-4 dark:text-white">Appearance</h3>
        <div className="flex gap-4">
          <button onClick={() => onThemeChange('light')} className={`p-4 border rounded-xl ${currentTheme === 'light' ? 'bg-indigo-50 border-indigo-500' : ''}`}>Light</button>
          <button onClick={() => onThemeChange('dark')} className={`p-4 border rounded-xl ${currentTheme === 'dark' ? 'bg-slate-700 text-white border-indigo-500' : 'dark:text-white'}`}>Dark</button>
        </div>
      </div>
    </div>
  );
};