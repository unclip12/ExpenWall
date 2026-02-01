import React, { useState, useEffect } from 'react';
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-2xl font-bold text-indigo-600">ExpenWall Loading...</p>
      </div>
    </div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ✨ ExpenWall Premium
        </h1>
        <p className="text-lg text-slate-600 mb-8">Please login to continue</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
        >
          Login
        </button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <header className="bg-white/90 backdrop-blur-md p-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ✨ ExpenWall Premium
          </h1>
          <button 
            onClick={() => auth.signOut()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-white shadow-2xl mb-8">
          <h2 className="text-5xl font-bold mb-4">🎉 Welcome to ExpenWall Premium!</h2>
          <p className="text-2xl opacity-90">Your account: {user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { emoji: '💰', title: 'Total Spent', value: '₹0', color: 'emerald' },
            { emoji: '📊', title: 'Transactions', value: '0', color: 'blue' },
            { emoji: '🛒', title: 'Products', value: '0', color: 'purple' },
            { emoji: '⚡', title: 'AI Insights', value: 'Ready', color: 'yellow' }
          ].map((card, i) => (
            <div key={i} className={`bg-white rounded-2xl p-8 shadow-xl border-2 border-${card.color}-200`}>
              <div className="text-6xl mb-4">{card.emoji}</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">{card.value}</h3>
              <p className="text-slate-600 text-lg">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-3xl p-12 shadow-2xl text-center">
          <h3 className="text-4xl font-bold text-slate-800 mb-6">🚀 App Features Coming Soon</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['📊 Dashboard', '💸 Transactions', '🛒 Products', '⚙️ Settings'].map(feature => (
              <div key={feature} className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                <p className="text-2xl font-semibold text-slate-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-20 p-8 text-center border-t-2 border-indigo-100">
        <p className="text-slate-600 text-lg">✨ ExpenWall Premium © 2026 | Vijayawada 🇮🇳</p>
      </footer>
    </div>
  );
}

export default App;
