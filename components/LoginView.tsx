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
      // App.tsx auth listener will handle the redirect
    } catch (err: any) {
      console.error(err);
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
              <label htmlFor="secretId" className="block text-sm font-semibold text-slate-700">
                Enter your Secret ID
              </label>
              <p className="text-xs text-slate-500">
                If you are new, just enter a unique ID to create your account.
              </p>
              <input
                id="secretId"
                type="text"
                value={secretId}
                onChange={(e) => setSecretId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg tracking-wide placeholder:text-slate-300"
                placeholder="my-secret-id"
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !secretId.trim()}
              className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Enter Wallet</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">
                Secure • Private • AI-Powered
            </p>
        </div>
      </div>
    </div>
  );
};
