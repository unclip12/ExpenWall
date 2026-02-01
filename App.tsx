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
import { Transaction, MerchantRule, Wallet, Product, ShopLocation, Person } from './types';
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
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<ShopLocation[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
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
    getUserProfile(user.uid).then(profile => {
      if (profile) {
        setTheme(profile.theme || 'light');
      }
    });
    return () => { unsubTx(); unsubRules(); unsubWallets(); unsubProducts(); };
  }, [user]);

  const handleAddTransaction = async (tx: any) => {
    await addTransactionToDb(tx, user.uid);
    setCurrentView('dashboard');
  };

  const handleCreateRule = async (original: string, renamed: string, category?: any, subcategory?: string) => {
    await addMerchantRule({
      originalName: original,
      renamedTo: renamed,
      forcedCategory: category,
      forcedSubcategory: subcategory
    }, user.uid);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <ThemeProvider><LoginView /></ThemeProvider>;

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
        <header className="bg-white/80 dark:bg-slate-800/80 p-4 sticky top-0 z-40 flex justify-between items-center border-b dark:border-slate-700 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-indigo-600">ExpenWall</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden"><Menu className="w-6 h-6 dark:text-white" /></button>
        </header>
        <div className="max-w-7xl mx-auto p-4 flex gap-6">
          <nav className={`md:w-64 ${isMobileMenuOpen ? 'block' : 'hidden md:block'} bg-white dark:bg-slate-800 p-4 rounded-xl h-fit sticky top-20 shadow-sm border border-slate-200 dark:border-slate-700`}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg dark:text-white mb-1 transition-colors ${currentView === item.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <main className="flex-1">
            {currentView === 'dashboard' && <Dashboard transactions={transactions} rules={rules} budgets={[]} />}
            {currentView === 'transactions' && <TransactionList transactions={transactions} rules={rules} userId={user.uid} wallets={wallets} onEditTransaction={() => {}} onDeleteTransaction={deleteTransaction} onCreateRule={handleCreateRule} />}
            {currentView === 'products' && <ProductsView products={products} priceHistory={[]} onProductClick={() => {}} />}
            {currentView === 'add' && <SmartTransactionForm onSubmit={handleAddTransaction} onClose={() => setCurrentView('dashboard')} shops={shops} persons={persons} />}
            {currentView === 'settings' && <EnhancedSettingsView userId={user.uid} currentTheme={theme} onThemeChange={setTheme} />}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;