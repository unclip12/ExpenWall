import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Filter, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, ProcessedTransaction, Category, MerchantRule } from '../types';
import { CURRENCIES, DEFAULT_CURRENCY, DATE_RANGE_PRESETS } from '../constants';
import { useProcessedTransactions } from '../hooks';

interface AnalyticsViewProps {
  transactions: Transaction[];
  rules: MerchantRule[];
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, rules }) => {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState<'trend' | 'category' | 'comparison'>('trend');
  
  const currency = localStorage.getItem('expenwall_currency') || DEFAULT_CURRENCY;
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';
  
  const processedTransactions = useProcessedTransactions(transactions, rules);

  // Filter by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const preset = DATE_RANGE_PRESETS.find(p => p.id === dateRange);
    if (!preset || preset.id === 'custom') return processedTransactions;

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - preset.days);

    return processedTransactions.filter(t => new Date(t.date) >= cutoffDate);
  }, [processedTransactions, dateRange]);

  // Spending Trend Data (Daily/Weekly/Monthly)
  const trendData = useMemo(() => {
    const grouped: Record<string, { date: string; income: number; expense: number }> = {};

    filteredTransactions.forEach(t => {
      const date = t.date;
      if (!grouped[date]) {
        grouped[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        grouped[date].income += t.amount;
      } else {
        grouped[date].expense += t.amount;
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  // Category Breakdown
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        grouped[t.displayCategory] = (grouped[t.displayCategory] || 0) + t.amount;
      });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Top Merchants
  const topMerchants = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        grouped[t.displayMerchant] = (grouped[t.displayMerchant] || 0) + t.amount;
      });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredTransactions]);

  // Income vs Expense Comparison
  const comparisonData = useMemo(() => {
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Income', value: totalIncome, fill: '#10b981' },
      { name: 'Expense', value: totalExpense, fill: '#ef4444' },
    ];
  }, [filteredTransactions]);

  // Summary Stats
  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = expense / filteredTransactions.filter(t => t.type === 'expense').length || 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      avgTransaction,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center animate-in fade-in duration-500 p-8">
         <div className="w-32 h-32 bg-indigo-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
           <TrendingUp className="w-16 h-16 text-indigo-400 dark:text-indigo-300" />
         </div>
         <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">No Analytics Available</h3>
         <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg">
           We need some data to crunch numbers! Once you start adding transactions, this dashboard will light up with insights.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
            <p className="text-indigo-100">Deep insights into your spending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {DATE_RANGE_PRESETS.filter(p => p.id !== 'custom').map(preset => (
              <option key={preset.id} value={preset.id}>{preset.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="trend">Spending Trend</option>
            <option value="category">Category Breakdown</option>
            <option value="comparison">Income vs Expense</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Income</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{currencySymbol}{stats.totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Expense</span>
            <DollarSign className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{currencySymbol}{stats.totalExpense.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Net Balance</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {currencySymbol}{stats.netBalance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Avg Transaction</span>
            <PieChartIcon className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{currencySymbol}{stats.avgTransaction.toFixed(2)}</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
          {chartType === 'trend' && 'Spending Trend Over Time'}
          {chartType === 'category' && 'Expense by Category'}
          {chartType === 'comparison' && 'Income vs Expense'}
        </h3>

        <div className="h-80">
          {chartType === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === 'category' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`}
                />
                <Bar dataKey="value" name="Spent">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'comparison' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={comparisonData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${currencySymbol}${value.toFixed(2)}`}
                  outerRadius={120}
                  dataKey="value"
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top 10 Merchants</h3>
        <div className="space-y-3">
          {topMerchants.map((merchant, index) => (
            <div key={merchant.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                  {index + 1}
                </div>
                <span className="font-medium text-slate-800 dark:text-white">{merchant.name}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-white">{currencySymbol}{merchant.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};