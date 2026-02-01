import React, { useState } from 'react';
import { 
  Users, 
  Edit
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/transactionUtils';
import { Person, Transaction } from '../types';

interface PersonTransactionsViewProps {
  person: Person;
  onEditPerson: (person: Person) => void;
}

export const PersonTransactionsView: React.FC<PersonTransactionsViewProps> = ({
  person,
  onEditPerson
}) => {
  const netBalance = person.totalReceived - person.totalSent;
  const balanceText = netBalance > 0 
    ? `They owe you ${formatCurrency(netBalance)}`
    : netBalance < 0 
      ? `You owe them ${formatCurrency(Math.abs(netBalance))}`
      : "Balance settled";

  const transactions = person.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{person.name}</h1>
              <p className="text-xl opacity-90 capitalize">{person.type}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1">
            {/* Stats Cards */}
            <div className="bg-white/30 backdrop-blur-xl p-6 rounded-2xl flex-1">
              <div className="text-3xl font-bold text-emerald-400">
                {formatCurrency(person.totalReceived)}
              </div>
              <div className="text-sm opacity-75 uppercase tracking-wide">Total Received</div>
            </div>
            
            <div className="bg-white/30 backdrop-blur-xl p-6 rounded-2xl flex-1">
              <div className={`text-3xl font-bold ${person.totalSent > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                {formatCurrency(person.totalSent)}
              </div>
              <div className="text-sm opacity-75 uppercase tracking-wide">Total Sent</div>
            </div>
            
            <div className={`bg-white/30 backdrop-blur-xl p-6 rounded-2xl flex-1 ${
              netBalance > 0 ? 'ring-2 ring-emerald-400/30' : netBalance < 0 ? 'ring-2 ring-orange-400/30' : ''
            }`}>
              <div className={`text-3xl font-bold ${netBalance > 0 ? 'text-emerald-400' : netBalance < 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                {formatCurrency(Math.abs(netBalance))}
              </div>
              <div className={`text-sm uppercase tracking-wide font-semibold ${
                netBalance > 0 ? 'text-emerald-300' : netBalance < 0 ? 'text-orange-300' : 'text-slate-300'
              }`}>
                {netBalance > 0 ? 'Receivable' : netBalance < 0 ? 'Payable' : 'Settled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-700">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              +{person.totalReceived > 0 ? formatCurrency(person.totalReceived) : '₹0'}
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Income</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Money received from {person.name}
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-700">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              -{person.totalSent > 0 ? formatCurrency(person.totalSent) : '₹0'}
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Expense</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Money sent to {person.name}
            </p>
          </div>

          <div className={`text-center p-6 rounded-2xl ${
            netBalance > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800' :
            netBalance < 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800' :
            'bg-slate-50 dark:bg-slate-700'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              netBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' :
              netBalance < 0 ? 'text-orange-600 dark:text-orange-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {formatCurrency(Math.abs(netBalance))}
            </div>
            <h4 className={`font-semibold mb-1 ${
              netBalance !== 0 ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              Net Balance
            </h4>
            <p className={`text-sm ${
              netBalance > 0 ? 'text-emerald-700 dark:text-emerald-300 font-semibold' :
              netBalance < 0 ? 'text-orange-700 dark:text-orange-300 font-semibold' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {balanceText}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-3">
            Recent Transactions
          </h3>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700 rounded-2xl overflow-hidden shadow-sm">
            {transactions.slice(0, 10).map((tx, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                      tx.type === 'income' 
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
                    }`}>
                      {tx.type === 'income' ? '₹' : '-₹'}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 dark:text-white">{tx.merchant}</p>
                      {tx.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{tx.notes}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {transactions.length > 10 && (
            <div className="text-center pt-4">
              <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                Show all {transactions.length} transactions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => onEditPerson(person)}
          className="flex-1 flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Contact Details</span>
        </button>
        
        {netBalance !== 0 && (
          <button className={`flex-1 px-8 py-4 rounded-2xl font-semibold shadow-xl transition-all ${
            netBalance > 0 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/25 shadow-emerald-500/25' 
              : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/25 shadow-orange-500/25'
          }`}>
            {netBalance > 0 ? 'Remind Payment' : 'Mark as Paid'}
          </button>
        )}
      </div>
    </div>
  );
};