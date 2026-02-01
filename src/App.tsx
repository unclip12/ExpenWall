import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB9hQ_OHYvQ8p5sX5LZ4cG0YK8T3Xm8qZE",
  authDomain: "expenwall-unclip12.firebaseapp.com",
  projectId: "expenwall-unclip12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    signInAnonymously(auth).then(() => {
      auth.onAuthStateChanged(setUser);
    });
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-indigo-50">
    <p className="text-2xl font-bold text-indigo-600">Loading ExpenWall...</p>
  </div>;

  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <header className="bg-white/90 backdrop-blur p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ✨ ExpenWall Premium
        </h1>
        <button onClick={() => auth.signOut()} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg">
          Logout
        </button>
      </div>
    </header>

    <main className="max-w-7xl mx-auto p-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-12 text-white shadow-2xl">
        <h2 className="text-5xl font-bold mb-4">🎉 ExpenWall is LIVE!</h2>
        <p className="text-2xl">Logged in as: {user.email || 'Anonymous User'}</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-8">
        {[
          { emoji: '💰', title: 'Total', value: '₹0' },
          { emoji: '📊', title: 'Transactions', value: '0' },
          { emoji: '🛒', title: 'Products', value: '0' },
          { emoji: '⚡', title: 'AI Ready', value: 'Yes' }
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">{c.emoji}</div>
            <h3 className="text-3xl font-bold mb-2">{c.value}</h3>
            <p className="text-slate-600">{c.title}</p>
          </div>
        ))}
      </div>
    </main>

    <footer className="mt-20 p-8 text-center">
      <p className="text-slate-600 text-lg">✨ ExpenWall © 2026</p>
    </footer>
  </div>;
}

export default App;
