import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { AIInsight, Transaction } from '../types';
import { generateLocalInsights } from '../utils/insightsEngine';
import { geminiService } from '../services/geminiService';

interface InsightsPanelProps {
  transactions: Transaction[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ transactions }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [transactions]);

  const loadInsights = () => {
    const localInsights = generateLocalInsights(transactions);
    setInsights(localInsights);
  };

  const refreshWithAI = async () => {
    setIsLoading(true);
    try {
      const aiData = await geminiService.generateInsights(transactions);
      
      const aiInsights: AIInsight[] = [
        ...aiData.patterns.map((p, i) => ({
          id: `ai-pattern-${i}`,
          type: 'pattern' as const,
          title: 'Spending Pattern',
          description: p,
          priority: 'medium' as const,
          actionable: false,
          createdAt: new Date(),
        })),
        ...aiData.anomalies.map((a, i) => ({
          id: `ai-anomaly-${i}`,
          type: 'anomaly' as const,
          title: 'Unusual Activity',
          description: a,
          priority: 'high' as const,
          actionable: false,
          createdAt: new Date(),
        })),
        ...aiData.suggestions.map((s, i) => ({
          id: `ai-suggestion-${i}`,
          type: 'suggestion' as const,
          title: 'Savings Tip',
          description: s,
          priority: 'medium' as const,
          actionable: true,
          createdAt: new Date(),
        })),
      ];

      setInsights(aiInsights);
      setUseAI(true);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      alert('Failed to generate AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'pattern':
        return <TrendingUp className="w-5 h-5" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'pattern':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'anomaly':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
      case 'suggestion':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300';
      default:
        return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  if (insights.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {useAI ? 'AI Insights' : 'Smart Insights'}
          </h3>
        </div>
        <button
          onClick={refreshWithAI}
          disabled={isLoading}
          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh with AI"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 5).map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border ${getColor(insight.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-90">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};