import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { Menu, X, LogOut } from 'lucide-react';
import { NAV_ITEMS, DEFAULT_CURRENCY } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginView } from './components/LoginView';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { ProductsView } from './components/ProductsView';
import { SmartTransactionForm } from './components/SmartTransactionForm';
import { EnhancedSettingsView } from './components/EnhancedSettingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetView } from './components/BudgetView';
import { RecurringView } from './components/RecurringView';
import { AnalyzerView } from './components/AnalyzerView';
import { BuyingListView } from './components/BuyingListView';
import { ExportView } from './components/ExportView';
import { RulesView } from './components/RulesView';
import { Transaction, MerchantRule, Wallet, Product, ShopLocation, Person, BuyingItem, AnalyzerState, DraftTransaction, Category } from './types';
import { 
  subscribeToTransactions, 
  subscribeToRules, 
  subscribeToWallets,
  subscribeToProducts,
  subscribeToBuyingList,
  addTransactionToDb,
  addTransactionsBatch,
  deleteTransaction,
  addMerchantRule,
  getUserProfile
} from './services/firestoreService';
import { geminiService } from './services/geminiService';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [buyingList, setBuyingList] = useState<BuyingItem[]>([]);
  const [shops, setShops] = useState<ShopLocation[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [theme, setTheme] = useState('light');

  // Analyzer State
  const [analyzerState, setAnalyzerState] = useState<AnalyzerState>({
    messages: [{ role: 'bot', text: 'Hello! Upload a bank statement image, or type a transaction to parse.' }],
    drafts: [],
    isProcessing: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
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
    const unsubBuying = subscribeToBuyingList(user.uid, setBuyingList);

    // Load user profile
    getUserProfile(user.uid).then(profile => {
      if (profile) {
        setTheme(profile.theme || 'light');
        if (profile.theme === 'dark') document.documentElement.classList.add('dark');
        localStorage.setItem('expenwall_currency', DEFAULT_CURRENCY); // Ensure default if missing
      }
    });

    return () => {
      unsubTx();
      unsubRules();
      unsubWallets();
      unsubProducts();
      unsubBuying();
    };
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

  const handleLogout = () => {
    auth.signOut();
  };

  // --- Analyzer Handlers ---

  const handleAnalyzeImage = async (file: File) => {
    setAnalyzerState(prev => ({ ...prev, isProcessing: true }));
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        const result = await geminiService.analyzeBankStatement(base64Data, file.type);
        
        const newDrafts: DraftTransaction[] = result.transactions.map((t, i) => ({
          id: `draft-${Date.now()}-${i}`,
          merchant: t.merchant,
          date: t.date,
          amount: t.amount,
          type: t.type,
          category: t.category,
          subcategory: t.subcategory
        }));

        setAnalyzerState(prev => ({
          ...prev,
          drafts: newDrafts,
          messages: [...prev.messages, { role: 'bot', text: `Extracted ${newDrafts.length} transactions. Review them below or chat to make corrections.` }],
          isProcessing: false
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setAnalyzerState(prev => ({ 
        ...prev, 
        isProcessing: false,
        messages: [...prev.messages, { role: 'bot', text: 'Failed to process image. Please try again.' }] 
      }));
    }
  };

  const handleAnalyzerMessage = async (text: string) => {
    const newMessages = [...analyzerState.messages, { role: 'user', text } as const];
    setAnalyzerState(prev => ({ ...prev, messages: newMessages, isProcessing: true }));

    try {
      if (analyzerState.drafts.length > 0) {
        // Refinement mode
        const refinedDrafts = await geminiService.refineBankStatement(analyzerState.drafts, text);
        setAnalyzerState(prev => ({
          ...prev,
          drafts: refinedDrafts,
          messages: [...newMessages, { role: 'bot', text: 'Updated drafts based on your feedback.' }],
          isProcessing: false
        }));
      } else {
        // Parsing mode
        const result = await geminiService.parseNaturalLanguage(text);
        if (result.merchant) {
          const draft: DraftTransaction = {
            id: `draft-${Date.now()}`,
            merchant: result.merchant,
            amount: result.amount,
            date: result.date,
            category: result.category,
            type: result.type,
            subcategory: ''
          };
           setAnalyzerState(prev => ({
            ...prev,
            drafts: [draft],
            messages: [...newMessages, { role: 'bot', text: 'Parsed transaction. Review below.' }],
            isProcessing: false
          }));
        } else {
           setAnalyzerState(prev => ({
            ...prev,
            messages: [...newMessages, { role: 'bot', text: "I couldn't parse that as a transaction. Try 'Starbucks 500 for coffee'." }],
            isProcessing: false
          }));
        }
      }
    } catch (error) {
      setAnalyzerState(prev => ({
        ...prev,
        isProcessing: false,
        messages: [...newMessages, { role: 'bot', text: 'Sorry, I encountered an error.' }]
      }));
    }
  };

  const handleSaveAnalyzerDrafts = async (drafts: Omit<Transaction, 'id'>[]) => {
    await addTransactionsBatch(drafts, user.uid);
    setAnalyzerState({
      messages: [{ role: 'bot', text: 'All transactions saved successfully!' }],
      drafts: [],
      isProcessing: false
    });
    // Optional: Switch to transactions view
    // setCurrentView('transactions'); 
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
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <nav className={`md:w-64 ${isMobileMenuOpen ? 'block' : 'hidden md:block'} flex-shrink-0`}>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg sticky top-24">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
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
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div className="my-2 border-t border-slate-200 dark:border-slate-700"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
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
              
              {currentView === 'analytics' && (
                <AnalyticsView transactions={transactions} rules={rules} />
              )}

              {currentView === 'budgets' && (
                <BudgetView userId={user.uid} transactions={transactions} />
              )}

              {currentView === 'recurring' && (
                <RecurringView userId={user.uid} />
              )}

              {currentView === 'analyzer' && (
                <AnalyzerView 
                  state={analyzerState}
                  onStateChange={(updates) => setAnalyzerState(prev => ({ ...prev, ...updates }))}
                  onSaveTransactions={handleSaveAnalyzerDrafts}
                  onAnalyzeImage={handleAnalyzeImage}
                  onSendMessage={handleAnalyzerMessage}
                />
              )}

              {currentView === 'buying-list' && (
                <BuyingListView items={buyingList} userId={user.uid} />
              )}

              {currentView === 'export' && (
                <ExportView transactions={transactions} rules={rules} />
              )}

              {currentView === 'rules' && (
                <RulesView rules={rules} />
              )}

              {currentView === 'settings' && (
                <EnhancedSettingsView
                  userId={user.uid}
                  currentTheme={theme}
                  onThemeChange={(newTheme) => {
                    setTheme(newTheme);
                    if (newTheme === 'dark') document.documentElement.classList.add('dark');
                    else if (newTheme === 'light') document.documentElement.classList.remove('dark');
                  }}
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