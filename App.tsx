import React, { useState, useEffect } from 'react';
import { Menu, X, PlusCircle, Wallet, Loader2, LogOut } from 'lucide-react';
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from './firebase';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { NAV_ITEMS } from './constants';
import { Transaction } from './types';
import { subscribeToTransactions, addTransactionToDb } from './services/firestoreService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Handle Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore updates once User is authenticated
  useEffect(() => {
    if (!user) {
        setTransactions([]);
        return;
    }

    const unsubscribe = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!user) {
      alert("You must be signed in to save transactions.");
      return;
    }

    setIsSaving(true);
    try {
      await addTransactionToDb(newTx, user.uid);
      setShowAddModal(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Failed to save transaction", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // 1. Loading State
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        </div>
    );
  }

  // 2. Unauthenticated State (Login View)
  if (!user) {
      return <LoginView />;
  }

  // 3. Authenticated App Content
  const renderContent = () => {
    if (showAddModal) {
      if (isSaving) {
         return (
             <div className="flex flex-col items-center justify-center h-64">
                 <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                 <p className="text-slate-600 font-medium">Saving transaction...</p>
             </div>
         )
      }
      return (
        <TransactionForm 
          onSubmit={handleAddTransaction} 
          onCancel={() => setShowAddModal(false)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return <TransactionList transactions={transactions} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Expenwall
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
             if (item.id === 'add') return null; // Handle add button separately
             return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowAddModal(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id && !showAddModal
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id && !showAddModal ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
           <button
             onClick={() => setShowAddModal(true)}
             className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
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
      <div className="md:hidden fixed w-full bg-white z-30 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-20 pt-20 px-6 md:hidden flex flex-col">
          <nav className="space-y-4 flex-1">
             {NAV_ITEMS.map((item) => {
               if (item.id === 'add') return null;
               return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowAddModal(false);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 p-4 rounded-xl text-lg ${
                    activeTab === item.id && !showAddModal ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              )
             })}
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl text-lg bg-indigo-600 text-white font-bold mt-4"
              >
                <PlusCircle className="w-6 h-6" />
                <span>Add Transaction</span>
              </button>
          </nav>
          
          <div className="mb-8">
            <button 
                onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 p-4 text-red-500 bg-red-50 rounded-xl font-medium"
            >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 mt-14 md:mt-0 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 hidden md:block">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                    {showAddModal ? 'New Transaction' : activeTab === 'dashboard' ? 'Overview' : activeTab === 'settings' ? 'Settings' : 'Transactions'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                    {showAddModal ? 'Enter details manually or scan a receipt.' : activeTab === 'settings' ? 'Configure your preferences.' : 'Welcome back! Here is your financial summary.'}
                    </p>
                </div>
            </div>
          </header>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;