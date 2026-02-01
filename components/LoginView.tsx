import React, { useState } from 'react';
import { Wallet, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { loginWithSecretId } from '../firebase';

export const LoginView: React.FC = () => {
  const [secretId, setSecretId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretId.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithSecretId(secretId);
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-indigo-600">
           <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
             <Wallet className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">Welcome to Expenwall</h1>
           <p className="text-indigo-100 text-sm">Your intelligent wallet manager</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Enter your Secret ID</label>
              <input
                type="text"
                value={secretId}
                onChange={(e) => setSecretId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="my-secret-id"
                autoFocus
              />
            </div>
            {error && <div className="flex items-start space-x-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm"><AlertCircle className="w-5 h-5"/><span>{error}</span></div>}
            <button type="submit" disabled={isLoading || !secretId.trim()} className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="mr-2">Enter Wallet</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};