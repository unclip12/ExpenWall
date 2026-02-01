import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './components/LoginView';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-indigo-600">Loading ExpenWall...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <LoginView />
      </ThemeProvider>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', emoji: '📊' },
    { id: 'transactions', label: '💸 Transactions', emoji: '💸' },
    { id: 'products', label: '🛒 Products', emoji: '🛒' },
    { id: 'add', label: '⚡ Smart Add', emoji: '⚡' },
    { id: 'settings', label: '⚙️ Settings', emoji: '⚙️' },
  ];

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50'}`}>
        
        {/* Header */}
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 sticky top-0 z-50 shadow-lg border-b-2 border-indigo-100 dark:border-slate-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ ExpenWall Premium
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                👤 {user.email}
              </span>
              <button 
                onClick={() => auth.signOut()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-8 flex gap-8">
          
          {/* Sidebar */}
          <nav className="w-80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-2 border-indigo-100 dark:border-slate-700 h-fit sticky top-28">
            <h2 className="text-lg font-bold mb-6 text-slate-700 dark:text-slate-200 pb-4 border-b-2 border-indigo-100 dark:border-slate-600">
              🧭 Navigation
            </h2>
            {menuItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setCurrentView(item.id)} 
                className={`w-full text-left p-4 rounded-2xl mb-3 transition-all hover:scale-105 ${
                  currentView === item.id 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl scale-105' 
                    : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="font-semibold">{item.label.split(' ')[1]}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <main className="flex-1">
            
            {/* Dashboard View */}
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
                  <h2 className="text-4xl font-bold mb-2">Welcome back! 👋</h2>
                  <p className="text-xl opacity-90">Your ExpenWall Premium Dashboard</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-2 border-emerald-200 dark:border-emerald-800">
                    <div className="text-4xl mb-3">💰</div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹0</h3>
                    <p className="text-slate-600 dark:text-slate-400">Total Spent</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">0</h3>
                    <p className="text-slate-600 dark:text-slate-400">Transactions</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-2 border-purple-200 dark:border-purple-800">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">0%</h3>
                    <p className="text-slate-600 dark:text-slate-400">Budget Used</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Views - Beautiful Placeholders */}
            {currentView === 'transactions' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl border-4 border-dashed border-blue-300 dark:border-blue-700">
                <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-6xl shadow-2xl">
                  💸
                </div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transactions Coming Soon!</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">AI-powered transaction tracking will be live here</p>
              </div>
            )}

            {currentView === 'products' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl border-4 border-dashed border-emerald-300 dark:border-emerald-700">
                <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-6xl shadow-2xl">
                  🛒
                </div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Products Tracker</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Smart shopping with price alerts</p>
              </div>
            )}

            {currentView === 'add' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl border-4 border-dashed border-yellow-300 dark:border-yellow-700">
                <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-6xl shadow-2xl">
                  ⚡
                </div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Smart Transaction Form</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">AI analyzes electricity bills & receipts</p>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl border-4 border-dashed border-purple-300 dark:border-purple-700">
                <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-6xl shadow-2xl">
                  ⚙️
                </div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">Premium Settings</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Multi-AI, themes & advanced controls</p>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all"
                >
                  Toggle Theme: {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            )}

          </main>
        </div>

        {/* Footer */}
        <footer className="mt-20 p-8 text-center border-t-2 border-indigo-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            ✨ ExpenWall Premium © 2026 | Made with ❤️ in Vijayawada
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
