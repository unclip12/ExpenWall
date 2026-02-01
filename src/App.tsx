import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB9hQ_OHYvQ8p5sX5LZ4cG0YK8T3Xm8qZE",
  authDomain: "expenwall-unclip12.firebaseapp.com",
  projectId: "expenwall-unclip12",
  storageBucket: "expenwall-unclip12.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        auth.onAuthStateChanged((u) => {
          setUser(u);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-indigo-600">ExpenWall Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Authentication Failed</h1>
          <p className="text-lg text-slate-600 mb-6">Please check Firebase config</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold"
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md p-6 sticky top-0 z-50 shadow-xl border-b-2 border-indigo-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ ExpenWall Premium
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 bg-indigo-50 px-4 py-2 rounded-xl">
              👤 {user.email || 'Anonymous'}
            </span>
            <button 
              onClick={() => auth.signOut()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-white shadow-2xl mb-10">
          <h2 className="text-6xl font-bold mb-4">🎉 ExpenWall is LIVE!</h2>
          <p className="text-2xl opacity-90 mb-6">Premium expense tracking powered by AI</p>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
              <p className="text-sm opacity-75">USER ID</p>
              <p className="font-mono text-lg">{user.uid.slice(0, 12)}...</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
              <p className="text-sm opacity-75">STATUS</p>
              <p className="font-bold text-lg">✅ ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { emoji: '💰', title: 'Total Spent', value: '₹0', color: 'from-emerald-400 to-green-500', border: 'border-emerald-200' },
            { emoji: '📊', title: 'Transactions', value: '0', color: 'from-blue-400 to-indigo-500', border: 'border-blue-200' },
            { emoji: '🛒', title: 'Products Tracked', value: '0', color: 'from-purple-400 to-pink-500', border: 'border-purple-200' },
            { emoji: '⚡', title: 'AI Insights', value: 'Ready', color: 'from-yellow-400 to-orange-500', border: 'border-yellow-200' }
          ].map((card, i) => (
            <div key={i} className={`bg-white rounded-2xl p-8 shadow-xl border-2 ${card.border} hover:scale-105 transition-all`}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-4xl mb-4 shadow-lg`}>
                {card.emoji}
              </div>
              <h3 className="text-4xl font-bold text-slate-800 mb-2">{card.value}</h3>
              <p className="text-slate-600 text-lg">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Features Coming Soon */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-indigo-100">
          <h3 className="text-4xl font-bold text-slate-800 mb-8 text-center">🚀 Premium Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📊', name: 'Dashboard', desc: 'Real-time insights' },
              { icon: '💸', name: 'Transactions', desc: 'Smart tracking' },
              { icon: '🛒', name: 'Products', desc: 'Price alerts' },
              { icon: '⚙️', name: 'Settings', desc: 'Multi-AI config' },
              { icon: '📈', name: 'Analytics', desc: 'AI-powered' },
              { icon: '🔔', name: 'Alerts', desc: 'Budget tracking' },
              { icon: '📱', name: 'Mobile', desc: 'Responsive UI' },
              { icon: '🔒', name: 'Secure', desc: 'Firebase auth' }
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 hover:shadow-xl transition-all text-center">
                <div className="text-5xl mb-3">{feature.icon}</div>
                <p className="text-xl font-bold text-slate-800 mb-1">{feature.name}</p>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-20 p-8 text-center border-t-2 border-indigo-100">
        <p className="text-slate-600 text-lg mb-2">
          ✨ <strong>ExpenWall Premium</strong> © 2026
        </p>
        <p className="text-slate-500">
          Built with ❤️ in Vijayawada, India 🇮🇳
        </p>
      </footer>
    </div>
  );
}

export default App;
