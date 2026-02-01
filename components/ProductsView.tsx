import React from 'react';
import { Package } from 'lucide-react';
import { Product, PriceHistory } from '../types';

interface ProductsViewProps {
  products: Product[];
  priceHistory: PriceHistory[];
  onProductClick: (id: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products }) => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg flex items-center gap-4">
        <Package className="w-12 h-12" />
        <h2 className="text-3xl font-bold">Products</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border dark:border-slate-700">
            <h3 className="font-bold text-lg dark:text-white">{p.name}</h3>
            <p className="text-sm text-slate-500">{p.category}</p>
            <p className="font-bold text-emerald-600 mt-2">Avg: {p.avgPrice}</p>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-slate-500 col-span-full">No products tracked yet.</p>}
      </div>
    </div>
  );
};