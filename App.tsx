import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { 
  Transaction, 
  MerchantRule, 
  BuyingItem, 
  Wallet, 
  AnalyzerState, 
  DraftTransaction, 
  RecurringTransaction, 
  Budget, 
  Category,
  ProcessedTransaction,
  Product,
  PriceHistory
} from './types';
import { 
  subscribeToTransactions, 
  subscribeToRules, 
  subscribeToBuyingList,
  subscribeToWallets,
  subscribeToProducts,
  addTransactionToDb,
  addTransactionsBatch,
  subscribeToRecurringTransactions,
  subscribeToBudgets,
  updateTransaction,
  deleteTransaction,
  addMerchantRule,
  getUserProfile
} from './services/firestoreService';
import { geminiService } from './services/geminiService';
import { NAV_ITEMS } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { AnalyzerView } from './components/AnalyzerView';
import { BuyingListView } from './components/BuyingListView';
import { RulesView } from './components/RulesView';
import { SettingsView } from './components/SettingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetView } from './components/BudgetView';
import { RecurringView } from './components/RecurringView';
import { ExportView } from './components/ExportView';
import { NaturalInputModal } from './components/NaturalInputModal';
import { ProductsView } from './components/ProductsView';
import { SmartTransactionForm } from './components/SmartTransactionForm';
import { EnhancedSettingsView } from './components/EnhancedSettingsView';
import { Menu, X, Zap } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNaturalInput, setShowNaturalInput] = useState(false);
  const [showSmartForm, setShowSmartForm] = useState(false);

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [buyingList, setBuyingList] = useState<BuyingItem[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState('light');

  // Editing State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Analyzer State
  const [analyzerState, setAnalyzerState] = useState<AnalyzerState>({
    messages: [{ role: 'bot', text: 'Hello! Upload a bank statement image, or paste transaction JSON.' }],
    drafts: [],
    isProcessing: false,
  });

  // Derived data for shops and persons (extracted from transactions)
  const shops = React.useMemo(() => {
    const shopMap = new Map();
    transactions.forEach(tx => {
      if (tx.shopLocation) {
        const key = tx.shopLocation.shopName;
        if (!shopMap.has(key)) {
          shopMap.set(key, tx.shopLocation);
        }
      }
    });
    return Array.from(shopMap.values());
  }, [transactions]);

  const persons = React.useMemo(() => {
    const personMap = new Map();
    transactions.forEach(tx => {
      if (tx.personType) {
        const key = tx.merchant;
        if (!personMap.has(key)) {
          personMap.set(key, {
            name: tx.merchant,
            type: tx.personType
          });
        }
      }
    });
    return Array.from(personMap.values());
  }, [transactions]);

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
    const unsubBuying = subscribeToBuyingList(user.uid, setBuyingList);
    const unsubWallets = subscribeToWallets(user.uid, setWallets);
    const unsubRecurring = subscribeToRecurringTransactions(user.uid, setRecurring);
    const unsubBudgets = subscribeToBudgets(user.uid, setBudgets);
    const unsubProducts = subscribeToProducts(user.uid, setProducts);

    // Load user profile
    getUserProfile(user.uid).then(profile => {
      if (profile) {
        setApiKey(profile.geminiApiKey || profile.apiKey || '');
        setTheme(profile.theme || 'light');
      }
    });

    return () => {
      unsubTx();
      unsubRules();
      unsubBuying();
      unsubWallets();
      unsubRecurring();
      unsubBudgets();
      unsubProducts();
    };
  }, [user]);

  // Analyzer Handlers
  const handleAnalyzeImage = async (file: File) => {
    if (!apiKey) {
      setAnalyzerState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'bot', text: 'Please configure API Key in Settings first.' }]
      }));
      return;
    }

    setAnalyzerState(prev => ({ ...prev, isProcessing: true }));

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        const historyContext = analyzerState.drafts.length > 0
          ? `Current drafts: ${JSON.stringify(analyzerState.drafts)}`
          : '';

        const result = await geminiService.analyzeBankStatement(base64Data, file.type, apiKey, historyContext);

        const newDrafts: DraftTransaction[] = result.transactions.map((tx, idx) => ({
          id: `draft-${Date.now()}-${idx}`,
          merchant: tx.merchant,
          date: tx.date,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
        }));

        setAnalyzerState(prev => ({
          messages: [...prev.messages, { role: 'bot', text: `Found ${newDrafts.length} transactions. Review below.` }],
          drafts: [...prev.drafts, ...newDrafts],
          isProcessing: false,
        }));
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setAnalyzerState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'bot', text: `Error: ${error.message}` }],
        isProcessing: false,
      }));
    }
  };

  const handleSendMessage = async (text: string) => {
    setAnalyzerState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', text }],
    }));

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const newDrafts: DraftTransaction[] = parsed.map((tx, idx) => ({
          id: `draft-${Date.now()}-${idx}`,
          merchant: tx.merchant || 'Unknown',
          date: tx.date || new Date().toISOString().split('T')[0],
          amount: tx.amount || 0,
          type: tx.type || 'expense',
          category: tx.category || 'Other',
        }));

        setAnalyzerState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'bot', text: `Loaded ${newDrafts.length} transactions from JSON.` }],
          drafts: [...prev.drafts, ...newDrafts],
        }));
        return;
      }
    } catch {}

    // AI correction mode
    if (analyzerState.drafts.length > 0 && apiKey) {
      setAnalyzerState(prev => ({ ...prev, isProcessing: true }));

      try {
        const refined = await geminiService.refineBankStatement(analyzerState.drafts, text, apiKey);
        setAnalyzerState(prev => ({
          messages: [...prev.messages, { role: 'bot', text: 'Corrections applied!' }],
          drafts: refined,
          isProcessing: false,
        }));
      } catch (error: any) {
        setAnalyzerState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'bot', text: `Error: ${error.message}` }],
          isProcessing: false,
        }));
      }
    } else {
      setAnalyzerState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'bot', text: 'Upload an image or paste JSON to get started.' }],
      }));
    }
  };

  const handleSaveTransactions = async (txList: Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    await addTransactionsBatch(txList, user.uid);
    setAnalyzerState({ messages: [{ role: 'bot', text: 'Transactions saved! Upload more or clear.' }], drafts: [], isProcessing: false });
  };

  const handleSaveTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, tx);
      setEditingTransaction(null);
    } else {
      await addTransactionToDb(tx, user.uid);
    }
    setCurrentView('transactions');
    setShowSmartForm(false);
  };

  const handleEditTransaction = (tx: ProcessedTransaction) => {
    setEditingTransaction(tx as Transaction);
    setShowSmartForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
    }
  };

  const handleCreateRule = async (original: string, renamed: string, category?: Category, subcategory?: string) => {
    if (!user) return;
    await addMerchantRule({
      originalName: original,
      renamedTo: renamed,
      forcedCategory: category,
      forcedSubcategory: subcategory
    }, user.uid);
  };

  const handleNaturalInputSubmit = async ( any) => {
    if (!user) return;
    await addTransactionToDb({
      ...data,
      currency: localStorage.getItem('expenwall_currency') || 'INR',
    }, user.uid);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading ExpenWall Premium...</p>
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
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'} transition-colors duration-300`}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">💰</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    ExpenWall
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Premium Edition</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSmartForm(true)}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg"
                >
                  <Zap className="w-4 h-4" />
                  <span>Quick Add</span>
                </button>
                
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <nav className={`md:w-64 flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 dark:border-slate-700/20 sticky top-24">
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setEditingTransaction(null);
                        setIsMobileMenuOpen(false);
                        if (item.id === 'add') setShowSmartForm(true);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        currentView === item.id
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {currentView === 'dashboard' && <Dashboard transactions={transactions} rules={rules} budgets={budgets} apiKey={apiKey} />}
              {currentView === 'transactions' && (
                <TransactionList 
                  transactions={transactions} 
                  rules={rules} 
                  userId={user.uid} 
                  wallets={wallets} 
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onCreateRule={handleCreateRule}
                />
              )}
              {currentView === 'products' && (
                <ProductsView
                  products={products}
                  priceHistory={priceHistory}
                  onProductClick={(id) => console.log('Product clicked:', id)}
                />
              )}
              {currentView === 'analytics' && <AnalyticsView transactions={transactions} rules={rules} />}
              {currentView === 'budgets' && <BudgetView userId={user.uid} transactions={transactions} />}
              {currentView === 'recurring' && <RecurringView userId={user.uid} />}
              {currentView === 'analyzer' && <AnalyzerView apiKey={apiKey} state={analyzerState} onStateChange={(s) => setAnalyzerState(prev => ({ ...prev, ...s }))} onSaveTransactions={handleSaveTransactions} onAnalyzeImage={handleAnalyzeImage} onSendMessage={handleSendMessage} />}
              {currentView === 'buying-list' && <BuyingListView items={buyingList} userId={user.uid} />}
              {currentView === 'export' && <ExportView transactions={transactions} rules={rules} />}
              {currentView === 'rules' && <RulesView rules={rules} />}
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

        {/* Smart Transaction Form Modal */}
        {showSmartForm && (
          <SmartTransactionForm
            initialData={editingTransaction || undefined}
            onSubmit={handleSaveTransaction}
            onClose={() => {
              setShowSmartForm(false);
              setEditingTransaction(null);
            }}
            shops={shops}
            persons={persons}
          />
        )}

        {/* Natural Input Modal */}
        <NaturalInputModal
          isOpen={showNaturalInput}
          onClose={() => setShowNaturalInput(false)}
          onSubmit={handleNaturalInputSubmit}
          apiKey={apiKey}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
