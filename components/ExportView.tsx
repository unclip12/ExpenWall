import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Loader2, CheckCircle } from 'lucide-react';
import { Transaction, ProcessedTransaction, MerchantRule, Category } from '../types';
import { CATEGORIES, DATE_RANGE_PRESETS, CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { useProcessedTransactions } from '../hooks';
import { generateCSV, downloadCSV, generatePDF } from '../utils/exportUtils';

interface ExportViewProps {
  transactions: Transaction[];
  rules: MerchantRule[];
}

export const ExportView: React.FC<ExportViewProps> = ({ transactions, rules }) => {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState('month');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';
  const processedTransactions = useProcessedTransactions(transactions, rules);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    let filtered = [...processedTransactions];

    // Date filter
    const preset = DATE_RANGE_PRESETS.find(p => p.id === dateRange);
    if (preset && preset.id !== 'custom') {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - preset.days);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.displayCategory));
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processedTransactions, dateRange, selectedCategories]);

  const handleExport = async () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export!');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      if (format === 'csv') {
        const csv = generateCSV(filteredTransactions, currency);
        downloadCSV(csv, `expenwall-export-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // Calculate stats for PDF
        const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        const dateFrom = filteredTransactions[filteredTransactions.length - 1]?.date || '';
        const dateTo = filteredTransactions[0]?.date || '';

        await generatePDF(filteredTransactions, {
          currency,
          dateFrom,
          dateTo,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
        });
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCategory = (category: Category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const stats = React.useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Export Data</h2>
            <p className="text-emerald-100">Download your transactions</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Export Settings</h3>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Format</label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  format === 'csv'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-slate-800 dark:text-white">CSV</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spreadsheet compatible</p>
                </div>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  format === 'pdf'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-slate-800 dark:text-white">PDF</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Formatted report with charts</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {DATE_RANGE_PRESETS.filter(p => p.id !== 'custom').map(preset => (
                <option key={preset.id} value={preset.id}>{preset.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Categories (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategories.includes(category)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Export Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.count}</p>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{currencySymbol}{stats.income.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Expense</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{currencySymbol}{stats.expense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || filteredTransactions.length === 0}
        className="w-full p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center space-x-3"
      >
        {isExporting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : exportSuccess ? (
          <>
            <CheckCircle className="w-6 h-6" />
            <span>Export Successful!</span>
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            <span>Export {format.toUpperCase()}</span>
          </>
        )}
      </button>
    </div>
  );
};