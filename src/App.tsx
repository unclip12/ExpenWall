import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ProductsView } from './components/ProductsView';
import { SmartTransactionForm } from './components/SmartTransactionForm';
import { EnhancedSettingsView } from './components/EnhancedSettingsView';
import { PersonTransactionsView } from './components/PersonTransactionsView';
import { 
  subscribeToTransactions, 
  subscribeToRules, 
  subscribeToWallets, 
  subscribeToProducts,
  addTransactionToDb,
  deleteTransaction,
  addMerchantRule,
  getUserProfile
} from './services/firestoreService';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [persons, setPersons] = useState([]);
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

    const unsubTx = subscribeToTransactions(user.uid, setTransactions);
    const unsubRules = subscribeToRules(user.uid, setRules);
    const unsubWallets = subscribeToWallets(user.uid, setWallets);
    const unsubProducts = subscribeToProducts(user.uid, setProducts);

    // Load user profile
    getUserProfile(user.uid).then(profile => {
      if (profile) {
        setTheme(profile.theme || 'light');
      }
    });

    return () => {
      unsubTx();
      unsubRules();
      unsubWallets();
      unsubProducts();
    };
  }, [user]);

  const handleAddTransaction = async (tx: any) => {
    await addTransactionToDb(tx, user.uid);
    setShowTransactionForm(false);
  };

  const handleCreateRule = async (original: string, renamed: string, category?: any, subcategory?: string) => {
    await addMerchantRule({
      originalName: original,
      renamedTo: renamed,
      forcedCategory: category,
      forcedSubcategory: subcategory
    }, user.uid);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ExpenWall...</p>
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

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ExpenWall
              </h1>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <nav className={`md:w-64 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg sticky top-24">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all mb-1 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
              {currentView === 'dashboard' && <Dashboard transactions={transactions} rules={rules} budgets={[]} />}
              {currentView === 'transactions' && (
                <TransactionList
                  transactions={transactions}
                  rules={rules}
                  userId={user.uid}
                  wallets={wallets}
                  onEditTransaction={() => {}}
                  onDeleteTransaction={deleteTransaction}
                  onCreateRule={handleCreateRule}
                />
              )}
              {currentView === 'products' && (
                <ProductsView
                  products={products}
                  priceHistory={[]}
                  onProductClick={() => {}}
                />
              )}
              {currentView === 'add' && (
                <SmartTransactionForm
                  onSubmit={handleAddTransaction}
                  onClose={() => setCurrentView('dashboard')}
                  shops={shops}
                  persons={persons}
                />
              )}
              {currentView === 'settings' && (
                <EnhancedSettingsView
                  userId={user.uid}
                  currentTheme={theme}
                  onThemeChange={setTheme}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;