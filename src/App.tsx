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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => auth.onAuthStateChanged((u) => { setUser(u); setLoading(false); }))
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-2xl font-bold text-indigo-600">ExpenWall Loading...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Login Failed</h1>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <header className="bg-white/90 backdrop-blur p-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ✨ ExpenWall Premium
          </h1>
          <button onClick={() => auth.signOut()} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-12 text-white shadow-2xl mb-10">
          <h2 className="text-6xl font-bold mb-4">🎉 ExpenWall is LIVE!</h2>
          <p className="text-2xl">User: {user.email || user.uid.slice(0,8)}</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            {emoji:'💰',title:'Spent',value:'₹0',color:'emerald'},
            {emoji:'📊',title:'Transactions',value:'0',color:'blue'},
            {emoji:'🛒',title:'Products',value:'0',color:'purple'},
            {emoji:'⚡',title:'AI Ready',value:'Yes',color:'yellow'}
          ].map((c,i)=>(
            <div key={i} className={`bg-white rounded-2xl p-8 shadow-xl border-2 border-${c.color}-200`}>
              <div className="text-6xl mb-4">{c.emoji}</div>
              <h3 className="text-4xl font-bold">{c.value}</h3>
              <p className="text-slate-600">{c.title}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
