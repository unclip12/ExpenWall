import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  AlertCircle, 
  Search 
} from 'lucide-react';
import { Product, PriceHistory, Category } from '../types';
import { formatCurrency } from '../utils/transactionUtils';

interface ProductsViewProps {
  products: Product[];
  priceHistory: PriceHistory[];
  onProductClick: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onProductClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'avgPrice' | 'lastPurchased' | 'totalPurchases'>('avgPrice');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'avgPrice':
            return a.avgPrice - b.avgPrice;
          case 'lastPurchased':
            return new Date(b.lastPurchased).getTime() - new Date(a.lastPurchased).getTime();
          case 'totalPurchases':
            return b.totalPurchases - a.totalPurchases;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, sortBy, categoryFilter]);

  const getPriceTrendEmoji = (product: Product) => {
    return product.lowestPrice === product.avgPrice ? (
      <TrendingDown className="w-5 h-5 text-emerald-500" />
    ) : (
      <TrendingUp className="w-5 h-5 text-orange-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <Package className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="opacity-90">Track prices, find deals, and save money</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products (Dove Soap, Biryani...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="avgPrice">Avg Price (Low to High)</option>
            <option value="lastPurchased">Recently Purchased</option>
            <option value="totalPurchases">Most Purchased</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Categories</option>
            {/* Add categories dynamically if needed, or use static list */}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white dark:bg-slate-800 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 cursor-pointer hover:-translate-y-2"
            onClick={() => onProductClick(product.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{product.emoji || '📦'}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">
                    {product.name}
                    {product.brand && (
                      <span className="text-lg font-normal text-slate-500 dark:text-slate-400">
                        {' '}• {product.brand}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{product.category}</span>
                    {product.subcategory && (
                      <>
                        <span>•</span>
                        <span>{product.subcategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Price Trend */}
              <div className="flex flex-col items-end space-y-1 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                {getPriceTrendEmoji(product)}
                <span className="text-xs text-slate-500 dark:text-slate-400">Trend</span>
              </div>
            </div>

            {/* Price Stats */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.avgPrice)}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Avg Price</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">
                    {product.totalPurchases}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Purchases</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {formatCurrency(product.lowestPrice)}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">Best Deal</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(product.highestPrice)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Most Expensive</div>
                </div>
              </div>
            </div>

            {/* Best Shops */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2 text-sm uppercase tracking-wide">
                Best Shops
              </h4>
              <div className="space-y-1">
                {product.shops.slice(0, 3).map((shop, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-white truncate">{shop.shopName}</span>
                      {shop.area && <span className="text-xs text-slate-400">• {shop.area}</span>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(shop.avgPrice)}
                      </div>
                      <div className="text-xs text-slate-500">Avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Alerts */}
            {product.avgPrice > product.lowestPrice * 1.1 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-amber-800 dark:text-amber-200">
                      Price Alert
                    </h5>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You're paying <span className="font-bold">{((product.avgPrice / product.lowestPrice - 1) * 100).toFixed(0)}%</span> more than your best deal!
                      <br />
                      <span className="text-xs">Best price: {formatCurrency(product.lowestPrice)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
          <Package className="w-24 h-24 text-slate-400 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No products yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Add some transactions with item details to start tracking prices and finding the best deals.
          </p>
        </div>
      )}
    </div>
  );
};