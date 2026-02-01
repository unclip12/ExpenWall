import React, { useState } from 'react';
import { Plus, Trash2, Check, Folder, Bell, Calendar, ShoppingCart, Image as ImageIcon, ChevronDown, ChevronUp, AlertCircle, Store } from 'lucide-react';
import { BuyingItem, BuyingItemReminder } from '../types';
import { detectProductFields } from '../utils/productFieldMapping';
import { addBuyingItem, updateBuyingItem, updateBuyingItemStatus, deleteBuyingItem } from '../services/firestoreService';

interface EnhancedBuyingListViewProps {
  items: BuyingItem[];
  userId: string;
}

export const EnhancedBuyingListView: React.FC<EnhancedBuyingListViewProps> = ({ items, userId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState<Partial<BuyingItem>>({
    name: '',
    brand: '',
    estimatedPrice: 0,
    currency: '₹',
    platform: '',
    folder: '',
    targetDate: '',
    notes: '',
    productDetails: {},
    reminders: [],
    isBought: false
  });
  const [productFieldMapping, setProductFieldMapping] = useState<any>(null);

  // Get unique folders
  const folders = ['all', ...new Set(items.map(item => item.folder).filter(Boolean))] as string[];

  // Filter items by folder
  const filteredItems = selectedFolder === 'all' 
    ? items 
    : items.filter(item => item.folder === selectedFolder);

  // Group items by folder for display
  const groupedItems = filteredItems.reduce((acc, item) => {
    const folder = item.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(item);
    return acc;
  }, {} as Record<string, BuyingItem[]>);

  const handleProductNameChange = (name: string) => {
    setNewItem(prev => ({ ...prev, name }));
    
    // Detect product fields when user types
    if (name.length > 2) {
      const mapping = detectProductFields(name);
      setProductFieldMapping(mapping);
    }
  };

  const handleAddReminder = () => {
    setNewItem(prev => ({
      ...prev,
      reminders: [
        ...(prev.reminders || []),
        { type: 'days_before', value: 1, enabled: true }
      ]
    }));
  };

  const handleUpdateReminder = (index: number, field: string, value: any) => {
    setNewItem(prev => ({
      ...prev,
      reminders: prev.reminders?.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const handleRemoveReminder = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      reminders: prev.reminders?.filter((_, i) => i !== index)
    }));
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.estimatedPrice) return;

    await addBuyingItem({
      name: newItem.name,
      brand: newItem.brand,
      estimatedPrice: newItem.estimatedPrice,
      currency: newItem.currency || '₹',
      platform: newItem.platform,
      folder: newItem.folder,
      targetDate: newItem.targetDate,
      notes: newItem.notes,
      productDetails: newItem.productDetails || {},
      reminders: newItem.reminders || [],
      isBought: false
    }, userId);

    // Reset form
    setNewItem({
      name: '',
      brand: '',
      estimatedPrice: 0,
      currency: '₹',
      platform: '',
      folder: '',
      targetDate: '',
      notes: '',
      productDetails: {},
      reminders: [],
      isBought: false
    });
    setProductFieldMapping(null);
    setShowAddForm(false);
  };

  const handleToggleBought = async (id: string, currentStatus: boolean) => {
    await updateBuyingItemStatus(id, !currentStatus);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this item?')) {
      await deleteBuyingItem(id);
    }
  };

  const toggleItemExpansion = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Buying List</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Plan purchases, compare prices, set reminders</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Folder Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedFolder === folder
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4" />
              <span>{folder.charAt(0).toUpperCase() + folder.slice(1)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add New Item</h3>
          
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleProductNameChange(e.target.value)}
                  placeholder="e.g., Dove Soap, Immersion Rod"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {productFieldMapping && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    ✨ Detected: {productFieldMapping.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimated Price *</label>
                <input
                  type="number"
                  value={newItem.estimatedPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimatedPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Dynamic Product Fields */}
            {productFieldMapping && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Product-Specific Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productFieldMapping.fields.filter((f: any) => f.name !== 'price').map((field: any) => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {field.name.charAt(0).toUpperCase() + field.name.slice(1)} {field.required && '*'}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={newItem.productDetails?.[field.name] || ''}
                          onChange={(e) => setNewItem(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, [field.name]: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-sm outline-none"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={newItem.productDetails?.[field.name] || ''}
                          onChange={(e) => setNewItem(prev => ({
                            ...prev,
                            productDetails: { ...prev.productDetails, [field.name]: e.target.value }
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-sm outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Folder & Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Folder/Category</label>
                <input
                  type="text"
                  value={newItem.folder}
                  onChange={(e) => setNewItem(prev => ({ ...prev, folder: e.target.value }))}
                  placeholder="e.g., Rental Home Setup, Electronics"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform</label>
                <select
                  value={newItem.platform}
                  onChange={(e) => setNewItem(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select platform...</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Myntra">Myntra</option>
                  <option value="Tata CLiQ">Tata CLiQ</option>
                  <option value="Reliance Digital">Reliance Digital</option>
                  <option value="Croma">Croma</option>
                  <option value="Local Shop">Local Shop</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Target Purchase Date</label>
              <input
                type="date"
                value={newItem.targetDate}
                onChange={(e) => setNewItem(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Reminders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reminders</label>
                <button
                  onClick={handleAddReminder}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Add Reminder
                </button>
              </div>
              {newItem.reminders && newItem.reminders.length > 0 && (
                <div className="space-y-2">
                  {newItem.reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <select
                        value={reminder.type}
                        onChange={(e) => handleUpdateReminder(idx, 'type', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none"
                      >
                        <option value="days_before">Days Before</option>
                        <option value="hours_before">Hours Before</option>
                        <option value="on_date">On Date</option>
                      </select>
                      <input
                        type="number"
                        value={reminder.value}
                        onChange={(e) => handleUpdateReminder(idx, 'value', parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm outline-none"
                      />
                      <button
                        onClick={() => handleRemoveReminder(idx)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details, comparisons, specifications..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveItem}
                disabled={!newItem.name || !newItem.estimatedPrice}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all"
              >
                Save Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-700">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400">No items in your buying list yet. Add your first item!</p>
        </div>
      ) : (
        Object.entries(groupedItems).map(([folder, folderItems]) => (
          <div key={folder} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-700 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{folder}</h3>
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium">
                  {folderItems.length} items
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {folderItems.map(item => (
                <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => handleToggleBought(item.id, item.isBought)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.isBought
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {item.isBought && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <h4 className={`text-lg font-bold ${
                          item.isBought
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-white'
                        }`}>
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.platform && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium flex items-center space-x-1">
                            <Store className="w-3 h-3" />
                            <span>{item.platform}</span>
                          </span>
                        )}
                        {item.targetDate && (
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(item.targetDate).toLocaleDateString()}</span>
                          </span>
                        )}
                        {item.reminders && item.reminders.length > 0 && (
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium flex items-center space-x-1">
                            <Bell className="w-3 h-3" />
                            <span>{item.reminders.length} reminders</span>
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.notes}</p>
                      )}

                      {/* Expandable Details */}
                      {item.productDetails && Object.keys(item.productDetails).length > 0 && (
                        <button
                          onClick={() => toggleItemExpansion(item.id)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          {expandedItems.has(item.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Show Details</span>
                            </>
                          )}
                        </button>
                      )}

                      {expandedItems.has(item.id) && item.productDetails && (
                        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                          <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Product Details:</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(item.productDetails).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                                <span className="ml-2 font-medium text-slate-800 dark:text-white">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        ₹{item.estimatedPrice.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};