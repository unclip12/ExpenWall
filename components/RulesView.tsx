import React from 'react';
import { MerchantRule } from '../types';
import { Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { deleteMerchantRule } from '../services/firestoreService';

interface RulesViewProps {
  rules: MerchantRule[];
}

export const RulesView: React.FC<RulesViewProps> = ({ rules }) => {
  const handleDelete = async (id: string) => {
    if (confirm("Delete this smart rule? Future transactions with this name won't be auto-renamed.")) {
      await deleteMerchantRule(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-2xl shadow-lg text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Rules</h2>
            <p className="text-indigo-100">The app automatically cleans up names based on your past edits.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {rules.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-400">
             <Sparkles className="w-12 h-12 mb-4 opacity-20" />
             <p className="font-medium text-slate-600">No rules learned yet.</p>
             <p className="text-sm mt-2 max-w-sm">
               Go to the <b>Transactions</b> page and edit a merchant name. You'll be asked if you want to create a rule!
             </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
             <div className="bg-slate-50 p-4 grid grid-cols-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
               <div className="col-span-4">Detected Name</div>
               <div className="col-span-1 flex justify-center"><ArrowRight className="w-3 h-3"/></div>
               <div className="col-span-4">Renamed To</div>
               <div className="col-span-2">Category</div>
               <div className="col-span-1"></div>
             </div>
             {rules.map(rule => (
               <div key={rule.id} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors gap-2">
                 <div className="col-span-4 font-mono text-xs text-slate-500 bg-slate-100 p-1 rounded inline-block truncate">
                   {rule.originalName}
                 </div>
                 <div className="col-span-1 flex justify-center text-slate-300">
                   <ArrowRight className="w-4 h-4" />
                 </div>
                 <div className="col-span-4 font-bold text-slate-700 truncate">
                   {rule.renamedTo}
                 </div>
                 <div className="col-span-2 text-xs text-slate-500 truncate">
                   {rule.forcedCategory || '-'}
                 </div>
                 <div className="col-span-1 text-right">
                   <button 
                     onClick={() => handleDelete(rule.id)}
                     className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                     title="Delete Rule"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};