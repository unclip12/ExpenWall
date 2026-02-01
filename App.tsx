import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { SettingsView } from './components/SettingsView';
// ✅ SAFE - TEMP DISABLE NEW COMPONENTS
/*
import { ProductsView } from './components/ProductsView';
import { SmartTransactionForm } from './components/SmartTransactionForm';
import { EnhancedSettingsView } from './components/EnhancedSettingsView';
*/

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [products, setProducts] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Add your firestore subscriptions here later
    console.log('User logged in:', user.uid);
  }, [user]);

  const handleAddTransaction = async (tx: any) => {
    console.log('Add transaction:', tx);
    setCurrentView('dashboard');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">Loading ExpenWall...</div>;
  if (!user) return <ThemeProvider><LoginView /></ThemeProvider>;

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-indigo-50'}`}>
        {/* Header */}
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 sticky top-0 z-50 flex justify-between items-center border-b dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ExpenWall Premium ✨
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Menu className="w-6 h-6 dark:text-white" />
          </button>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6 lg:p-8 flex gap-8">
          
          {/* Sidebar Nav */}
          <nav className={`md:w-72 lg:w-80 ${isMobileMenuOpen ? 'block absolute top-20 left-4 z-40 md:static' : 'hidden md:block'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border dark:border-slate-700 h-fit sticky top-24`}>
            <h2 className="text-lg font-semibold mb-6 text-slate-800 dark:text-slate-200 pb-4 border-b dark:border-slate-600">Navigation</h2>
            {NAV_ITEMS.map(item => (
              <button 
                key={item.id} 
                onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }} 
                className={`w-full text-left p-4 rounded-xl mb-3 transition-all hover:scale-[1.02] hover:shadow-lg ${
                  currentView === item.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-h-[70vh] relative">
            {currentView === 'dashboard' && (
              <Dashboard transactions={transactions} rules={rules} budgets={[]} apiKey={apiKey} />
            )}
            {currentView === 'transactions' && (
              <TransactionList 
                transactions={transactions} 
                rules={rules} 
                userId={user.uid} 
                wallets={wallets} 
              />
            )}
            {/* ✅ TEMP PLACEHOLDERS - Add real components later */}
            {currentView === 'products' && (
              <div className="p-12 text-center rounded-3xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border-4 border-dashed border-emerald-200 dark:border-emerald-800">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center justify-center">
                  🛒
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">ProductsView Premium</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                  Smart shopping tracker with price alerts coming soon!
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}
            {currentView === 'add' && (
              <div className="p-12 text-center rounded-3xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-4 border-dashed border-yellow-200 dark:border-yellow-800">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                  ⚡
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">SmartTransactionForm</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                  AI-powered electricity bill analyzer coming soon!
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-xl transition-all"
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}
            {currentView === 'settings' && (
              <SettingsView userId={user.uid} currentTheme={theme} onThemeChange={setTheme} />
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-20 p-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t dark:border-slate-700">
          <p>ExpenWall Premium © 2026 | Built with ❤️ in Vijayawada</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
