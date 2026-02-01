import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, XCircle, TrendingUp, TrendingDown, Sparkles, Calendar, ShoppingBag, Zap, Trash2, Clock, Award, Trophy, Medal, Crown } from 'lucide-react';
import { Craving, CravingStats, CravingOutcome } from '../types';
import { CelebrationAnimation } from './CelebrationAnimation';
import { formatCurrency } from '../utils/transactionUtils';

interface CravingsViewProps {
  cravings: Craving[];
  userId: string;
  onAddCraving: (craving: Omit<Craving, 'id'>) => Promise<void>;
  onUpdateOutcome: (id: string, outcome: CravingOutcome) => Promise<void>;
  onDeleteCraving: (id: string) => Promise<void>;
}

interface ItemRanking {
  name: string;
  count: number;
  totalAmount: number;
}

export const CravingsView: React.FC<CravingsViewProps> = ({
  cravings,
  userId,
  onAddCraving,
  onUpdateOutcome,
  onDeleteCraving
}) => {
  const [showCelebration, setShowCelebration] = useState<{ type: 'success' | 'failure'; amount: number } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCraving, setNewCraving] = useState({
    platform: '',
    totalAmount: 0,
    items: [{ name: '', price: 0, quantity: 1 }] as { name: string; price: number; quantity: number }[],
    notes: ''
  });

  // Calculate stats and rankings
  const stats: CravingStats = cravings.reduce((acc, craving) => {
    acc.totalCravings++;
    
    if (craving.outcome === 'resisted') {
      acc.totalSaved += craving.totalAmount;
      acc.resistedCount++;
    } else if (craving.outcome === 'gave_in') {
      acc.totalWasted += craving.totalAmount;
      acc.gaveInCount++;
    }

    // Track most craved items (all items)
    craving.items.forEach(item => {
      const existing = acc.mostCravedItems.find(i => i.name === item.name);
      if (existing) {
        existing.count++;
        existing.totalAmount += item.price * item.quantity;
      } else {
        acc.mostCravedItems.push({
          name: item.name,
          count: 1,
          totalAmount: item.price * item.quantity
        });
      }
    });

    return acc;
  }, {
    totalSaved: 0,
    totalWasted: 0,
    resistanceRate: 0,
    totalCravings: 0,
    resistedCount: 0,
    gaveInCount: 0,
    mostCravedItems: [] as { name: string; count: number; totalAmount: number }[]
  });

  // Calculate Resistance Champions (items that were resisted)
  const resistanceChampions: ItemRanking[] = [];
  cravings.forEach(craving => {
    if (craving.outcome === 'resisted') {
      craving.items.forEach(item => {
        const existing = resistanceChampions.find(i => i.name === item.name);
        if (existing) {
          existing.count++;
          existing.totalAmount += item.price * item.quantity;
        } else {
          resistanceChampions.push({
            name: item.name,
            count: 1,
            totalAmount: item.price * item.quantity
          });
        }
      });
    }
  });
  resistanceChampions.sort((a, b) => b.count - a.count);

  // Calculate Weakness Zone (items that user gave in to)
  const weaknessZone: ItemRanking[] = [];
  cravings.forEach(craving => {
    if (craving.outcome === 'gave_in') {
      craving.items.forEach(item => {
        const existing = weaknessZone.find(i => i.name === item.name);
        if (existing) {
          existing.count++;
          existing.totalAmount += item.price * item.quantity;
        } else {
          weaknessZone.push({
            name: item.name,
            count: 1,
            totalAmount: item.price * item.quantity
          });
        }
      });
    }
  });
  weaknessZone.sort((a, b) => b.count - a.count);

  stats.resistanceRate = stats.totalCravings > 0 
    ? Math.round((stats.resistedCount / stats.totalCravings) * 100) 
    : 0;

  stats.mostCravedItems.sort((a, b) => b.count - a.count);

  // Helper function to get medal emoji
  const getMedal = (position: number) => {
    if (position === 0) return '👑'; // Crown for #1
    if (position === 1) return '🥈'; // Silver
    if (position === 2) return '🥉'; // Bronze
    return `${position + 1}`;
  };

  // Helper function to get medal gradient
  const getMedalGradient = (position: number) => {
    if (position === 0) return 'from-yellow-400 to-orange-500'; // Gold
    if (position === 1) return 'from-slate-300 to-slate-500'; // Silver
    if (position === 2) return 'from-orange-400 to-orange-600'; // Bronze
    return 'from-slate-200 to-slate-400';
  };

  // Render ranking card
  const RankingCard = ({ title, items, icon: Icon, color, emptyMessage }: {
    title: string;
    items: ItemRanking[];
    icon: any;
    color: string;
    emptyMessage: string;
  }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className={`text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2`}>
        <Icon className={`w-5 h-5 ${color}`} />
        <span>{title}</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm italic text-center py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:scale-102 transition-transform">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getMedalGradient(idx)} rounded-full flex items-center justify-center shadow-lg`}>
                  <span className="text-xl">{getMedal(idx)}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-800 dark:text-white block">{item.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.count}x occurrences</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800 dark:text-white">{formatCurrency(item.totalAmount)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Group by date
  const groupedByDate = cravings.reduce((acc, craving) => {
    const date = craving.cravedAt.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(craving);
    return acc;
  }, {} as Record<string, Craving[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // TODO: Integrate with Gemini AI to extract cart items
      // For now, manual entry
      alert('AI extraction coming soon! For now, please add items manually.');
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddItem = () => {
    setNewCraving(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: 0, quantity: 1 }]
    }));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setNewCraving(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (newCraving.items.length === 1) {
      alert('You must have at least one item!');
      return;
    }
    setNewCraving(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCraving = async () => {
    // Validate that at least one item has a name and price
    const validItems = newCraving.items.filter(item => item.name.trim() && item.price > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one item with a name and price!');
      return;
    }

    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setSaving(true);
    try {
      console.log('Saving craving with items:', validItems);
      console.log('Total amount:', total);
      console.log('User ID:', userId);
      
      await onAddCraving({
        items: validItems,
        totalAmount: total,
        platform: newCraving.platform || 'Other',
        outcome: 'pending',
        notes: newCraving.notes,
        cravedAt: new Date().toISOString()
      });

      console.log('Craving saved successfully!');
      
      // Reset form
      setNewCraving({
        platform: '',
        totalAmount: 0,
        items: [{ name: '', price: 0, quantity: 1 }],
        notes: ''
      });
      setShowAddForm(false);
      alert('🎉 Craving logged successfully! Mark it as resisted or gave in later.');
    } catch (error: any) {
      console.error('Failed to save craving:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Failed to save craving: ${error.message || 'Unknown error'}. Please check the console for details.`);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkOutcome = async (cravingId: string, outcome: 'resisted' | 'gave_in', amount: number) => {
    await onUpdateOutcome(cravingId, outcome);
    
    // Show celebration/disappointment animation
    setShowCelebration({
      type: outcome === 'resisted' ? 'success' : 'failure',
      amount
    });
  };

  const handleDeleteCraving = async (cravingId: string, itemName: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${itemName}"?\n\nThis cannot be undone.`);
    if (confirmed) {
      try {
        await onDeleteCraving(cravingId);
      } catch (error) {
        console.error('Failed to delete craving:', error);
        alert('Failed to delete craving. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation Overlay */}
      {showCelebration && (
        <CelebrationAnimation
          type={showCelebration.type}
          amount={showCelebration.amount}
          onComplete={() => setShowCelebration(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center space-x-2">
              <Sparkles className="w-8 h-8" />
              <span>Cravings Tracker</span>
            </h2>
            <p className="text-purple-100 text-sm mt-1">Resist temptations, save money!</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all"
          >
            {showAddForm ? 'Cancel' : '+ Log Craving'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              <span className="text-xs text-purple-100">Saved</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSaved)}</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown className="w-5 h-5 text-red-300" />
              <span className="text-xs text-purple-100">Wasted</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalWasted)}</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-xs text-purple-100">Resistance Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.resistanceRate}%</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-blue-300" />
              <span className="text-xs text-purple-100">Total Cravings</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalCravings}</div>
          </div>
        </div>
      </div>

      {/* Three Ranking Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Most Craved Items */}
        <RankingCard
          title="Overall Temptations"
          items={stats.mostCravedItems}
          icon={TrendingUp}
          color="text-orange-500"
          emptyMessage="No cravings logged yet. Start tracking!"
        />

        {/* Resistance Champions */}
        <RankingCard
          title="Resistance Champions"
          items={resistanceChampions}
          icon={Trophy}
          color="text-emerald-500"
          emptyMessage="No resisted cravings yet. You can do it!"
        />

        {/* Weakness Zone */}
        <RankingCard
          title="Weakness Zone"
          items={weaknessZone}
          icon={TrendingDown}
          color="text-red-500"
          emptyMessage="Great! You haven't given in to any cravings yet!"
        />
      </div>

      {/* Add New Craving Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Log New Craving</h3>
          
          {/* Platform Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform (Optional)</label>
            <select
              value={newCraving.platform}
              onChange={(e) => setNewCraving(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">Select platform...</option>
              <option value="Zepto">Zepto</option>
              <option value="Swiggy">Swiggy</option>
              <option value="Zomato">Zomato</option>
              <option value="Blinkit">Blinkit</option>
              <option value="Dunzo">Dunzo</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Craving Items *</label>
              <button
                onClick={handleAddItem}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                + Add Another Item
              </button>
            </div>

            <div className="space-y-3">
              {newCraving.items.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Item #{idx + 1}</span>
                    {newCraving.items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Item Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Biryani, Chips, Ice Cream"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Item Total: </span>
                    <span className="font-bold text-slate-800 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-purple-900 dark:text-purple-300">Total Amount:</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  ₹{newCraving.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes (Optional)</label>
            <textarea
              value={newCraving.notes}
              onChange={(e) => setNewCraving(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Why are you craving this? How are you feeling?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSaveCraving}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Log Craving'}
          </button>
        </div>
      )}

      {/* Cravings List by Date */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Your Cravings History</h3>
        
        {sortedDates.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 dark:text-slate-400">No cravings logged yet. Start tracking to build your willpower!</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {groupedByDate[date].map(craving => (
                  <div key={craving.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {craving.platform && (
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium">
                              {craving.platform}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(craving.cravedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {craving.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700 dark:text-slate-300">
                                {item.name} <span className="text-slate-400">x{item.quantity}</span>
                              </span>
                              <span className="font-mono text-slate-600 dark:text-slate-400">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {craving.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">{craving.notes}</p>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                          ₹{craving.totalAmount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDeleteCraving(craving.id, craving.items[0]?.name || 'this craving')}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                          title="Delete craving"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Outcome Buttons */}
                    {craving.outcome === 'pending' ? (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleMarkOutcome(craving.id, 'resisted', craving.totalAmount)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>I Resisted!</span>
                        </button>
                        <button
                          onClick={() => handleMarkOutcome(craving.id, 'gave_in', craving.totalAmount)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 transition-all"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>I Gave In</span>
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center space-x-2 py-3 rounded-xl ${
                        craving.outcome === 'resisted'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {craving.outcome === 'resisted' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Resisted! Saved ₹{craving.totalAmount}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span className="font-semibold">Gave In - Spent ₹{craving.totalAmount}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};