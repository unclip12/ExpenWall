import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, PlusCircle, Wallet, Loader2, LogOut, AlertTriangle } from 'lucide-react';
import firebase from "firebase/compat/app";
import { auth } from './firebase';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BuyingListView } from './components/BuyingListView';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { AnalyzerView } from './components/AnalyzerView';
import { RulesView } from './components/RulesView';
import { NAV_ITEMS } from './constants';
import { Transaction, BuyingItem, AnalyzerState, Category, DraftTransaction, MerchantRule, Wallet as WalletType } from './types';
import { subscribeToTransactions, addTransactionsBatch, addTransactionToDb, getUserProfile, subscribeToBuyingList, subscribeToRules, subscribeToWallets } from './services/firestoreService';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [buyingItems, setBuyingItems] = useState<BuyingItem[]>([]);
  const [merchantRules, setMerchantRules] = useState<MerchantRule[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');

  const [analyzerState, setAnalyzerState] = useState<AnalyzerState>({
    messages: [{ role: 'bot', text: 'Hello! Upload a bank statement image or paste transaction JSON. I will help you import them.' }],
    drafts: [],
    isProcessing: false
  });

  // ─── Firebase Config Guard ──────────────────────────────────────────────

  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Configuration Missing</h1>
        <p className="text-slate-600 max-w-md">
          The app could not connect to Firebase. Please check your environment variables.
        </p>
      </div>
    );
  }

  // ─── Auth Listener ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setTransactions([]);
        setBuyingItems([]);
        setMerchantRules([]);
        setWallets([]);
        setUserApiKey('');
      }
    });
    return () => unsubscribe();
  }, []);

  // ─── Data Subscriptions ─────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    const unsubs = [
      subscribeToTransactions(user.uid, setTransactions),
      subscribeToBuyingList(user.uid, setBuyingItems),
      subscribeToRules(user.uid, setMerchantRules),
      subscribeToWallets(user.uid, setWallets),
    ];

    getUserProfile(user.uid).then(profile => {
      if (profile?.apiKey) setUserApiKey(profile.apiKey);
      setLoading(false);
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  // ─── Analyzer Helpers ───────────────────────────────────────────────────

  const getHistoryContext = useCallback(() => {
    let context = "Explicit User Rules:\n";
    merchantRules.forEach(r => {
      context += `- When you see "${r.originalName}", output name "${r.renamedTo}" and category "${r.forcedCategory || 'Auto'}".\n`;
    });
    const mapping: Record<string, string> = {};
    transactions.forEach(t => { if (t.merchant && t.category) mapping[t.merchant] = t.category; });
    context += "\nPast History:\n" + JSON.stringify(mapping);
    return context;
  }, [merchantRules, transactions]);

  const handleAnalyzeImage = useCallback(async (file: File) => {
    if (!userApiKey) {
      setAnalyzerState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'bot', text: "Please configure your API Key in Settings first." }]
      }));
      return;
    }

    setAnalyzerState(prev => ({
      ...prev,
      isProcessing: true,
      messages: [...prev.messages, { role: 'user', text: "📷 Analyzing image..." }]
    }));

    try {
      const base64Data = await readFileAsBase64(file);
      const historyContext = getHistoryContext();
      const result = await geminiService.analyzeBankStatement(base64Data, file.type, userApiKey, historyContext);

      if (result.transactions && result.transactions.length > 0) {
        const newDrafts: DraftTransaction[] = result.transactions.map((t, idx) => ({
          id: `temp-${Date.now()}-${idx}`,
          merchant: t.merchant || "Unknown",
          date: t.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(String(t.amount)) || 0,
          type: t.type === 'income' ? 'income' : 'expense',
          category: t.category || Category.OTHER
        }));
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          drafts: [...prev.drafts, ...newDrafts],
          messages: [...prev.messages, { role: 'bot', text: `Found ${newDrafts.length} transaction${newDrafts.length !== 1 ? 's' : ''}. Review them below, then save.` }]
        }));
      } else {
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          messages: [...prev.messages, { role: 'bot', text: "No transactions could be found in this image. Try a clearer photo." }]
        }));
      }
    } catch (err: any) {
      setAnalyzerState(prev => ({
        ...prev,
        isProcessing: false,
        messages: [...prev.messages, { role: 'bot', text: `Error: ${err.message}` }]
      }));
    }
  }, [userApiKey, getHistoryContext]);

  const handleAnalyzerMessage = useCallback(async (text: string) => {
    setAnalyzerState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', text }]
    }));

    // If there are drafts, route through AI refinement
    if (analyzerState.drafts.length > 0) {
      if (!userApiKey) {
        setAnalyzerState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'bot', text: "API Key is needed for AI corrections. Please add one in Settings." }]
        }));
        return;
      }
      setAnalyzerState(prev => ({ ...prev, isProcessing: true }));
      try {
        const refinedDrafts = await geminiService.refineBankStatement(analyzerState.drafts, text, userApiKey);
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          drafts: refinedDrafts,
          messages: [...prev.messages, { role: 'bot', text: "Done! Drafts have been updated." }]
        }));
      } catch (err: any) {
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          messages: [...prev.messages, { role: 'bot', text: `Error: ${err.message}` }]
        }));
      }
      return;
    }

    // Otherwise, try to parse as JSON (local mode)
    setAnalyzerState(prev => ({ ...prev, isProcessing: true }));
    try {
      const cleanText = text.replace(/```json|```/g, '').trim();
      if (cleanText.startsWith('[') || cleanText.startsWith('{')) {
        let parsed = JSON.parse(cleanText);
        if (!Array.isArray(parsed) && parsed.transactions) parsed = parsed.transactions;
        if (!Array.isArray(parsed)) parsed = [parsed];

        const newDrafts: DraftTransaction[] = parsed.map((t: any, idx: number) => ({
          id: `manual-${Date.now()}-${idx}`,
          merchant: t.merchant || "Unknown",
          date: t.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(t.amount) || 0,
          type: t.type === 'income' ? 'income' : 'expense',
          category: t.category || Category.OTHER
        }));
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          drafts: [...prev.drafts, ...newDrafts],
          messages: [...prev.messages, { role: 'bot', text: `Parsed ${newDrafts.length} item${newDrafts.length !== 1 ? 's' : ''} from JSON.` }]
        }));
      } else {
        setAnalyzerState(prev => ({
          ...prev,
          isProcessing: false,
          messages: [...prev.messages, { role: 'bot', text: "I need an image upload or a JSON array of transactions. Try uploading a bank statement screenshot." }]
        }));
      }
    } catch {
      setAnalyzerState(prev => ({
        ...prev,
        isProcessing: false,
        messages: [...prev.messages, { role: 'bot', text: "That doesn't look like valid JSON. Please check the format and try again." }]
      }));
    }
  }, [userApiKey, analyzerState.drafts]);

  // ─── Transaction Handlers ───────────────────────────────────────────────

  const handleAddTransaction = useCallback(async (newTx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addTransactionToDb(newTx, user.uid);
      setShowAddModal(false);
      setActiveTab('dashboard');
    } catch {
      alert("Failed to save transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const handleBulkAddTransactions = useCallback(async (newTxs: Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addTransactionsBatch(newTxs, user.uid);
      setAnalyzerState(prev => ({
        ...prev,
        drafts: [],
        messages: [...prev.messages, { role: 'bot', text: `✅ Saved ${newTxs.length} transaction${newTxs.length !== 1 ? 's' : ''} successfully!` }]
      }));
      setActiveTab('dashboard');
    } catch {
      alert("Some transactions failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const handleLogout = useCallback(() => { if (auth) auth.signOut(); }, []);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );
  if (!user) return <LoginView />;

  const renderContent = () => {
    if (showAddModal) {
      if (isSaving) return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600">Saving...</p>
        </div>
      );
      return (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddModal(false)}
          apiKey={userApiKey}
          onOpenSettings={() => { setShowAddModal(false); setActiveTab('settings'); }}
          wallets={wallets}
        />
      );
    }

    if (isSaving) return (
      <div className="flex justify-center h-full items-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} rules={merchantRules} />;
      case 'transactions':
        return <TransactionList transactions={transactions} rules={merchantRules} userId={user.uid} wallets={wallets} />;
      case 'analyzer':
        return (
          <AnalyzerView
            apiKey={userApiKey}
            state={analyzerState}
            onStateChange={(newState) => setAnalyzerState(prev => ({ ...prev, ...newState }))}
            onSaveTransactions={handleBulkAddTransactions}
            onAnalyzeImage={handleAnalyzeImage}
            onSendMessage={handleAnalyzerMessage}
          />
        );
      case 'buying-list':
        return <BuyingListView items={buyingItems} userId={user.uid} />;
      case 'rules':
        return <RulesView rules={merchantRules} />;
      case 'settings':
        return <SettingsView currentApiKey={userApiKey} onApiKeyUpdate={(key) => setUserApiKey(key)} userId={user.uid} />;
      default:
        return <Dashboard transactions={transactions} rules={merchantRules} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 text-slate-900 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-xl border-r border-white/20 fixed h-full z-20 shadow-xl">
        <div className="p-6 flex items-center space-x-3 border-b border-white/20">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Expenwall
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            if (item.id === 'add') return null;
            const isActive = activeTab === item.id && !showAddModal;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setShowAddModal(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white shadow-lg text-indigo-700 font-bold border border-white/40'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20 space-y-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Add Transaction</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-slate-400 hover:text-red-500 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white/80 backdrop-blur-xl z-30 border-b border-white/20 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">Expenwall</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-20 pt-20 px-6 md:hidden flex flex-col">
          <nav className="space-y-4 flex-1">
            {NAV_ITEMS.map((item) => {
              if (item.id === 'add') return null;
              const isActive = activeTab === item.id && !showAddModal;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setShowAddModal(false); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl text-lg ${
                    isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => { setShowAddModal(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-4 p-4 rounded-2xl text-lg bg-indigo-600 text-white font-bold mt-4 shadow-lg"
            >
              <PlusCircle className="w-6 h-6" />
              <span>Add Transaction</span>
            </button>
          </nav>
          <div className="mb-8">
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 p-4 text-red-500 bg-red-50 rounded-2xl font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 mt-14 md:mt-0 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Reads a File and returns the base64 data portion (strips the data-URL prefix). */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default App;