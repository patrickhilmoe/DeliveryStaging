import React, { useState, useMemo } from 'react';
import { Search, Package, CheckCircle, AlertCircle } from 'lucide-react';

export interface Product {
  id: string;
  modelNumber: string;
  description: string;
  category: string;
  price: string;
  inStock: boolean;
}

interface ProductTableProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchedProducts: string[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  searchQuery,
  onSearchChange,
  matchedProducts,
  selectedProduct,
  onProductSelect
}) => {
  const [sortBy, setSortBy] = useState<'modelNumber' | 'category' | 'description'>('modelNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = products.filter(product =>
        product.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortBy].toLowerCase();
      const bValue = b[sortBy].toLowerCase();
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, searchQuery, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getRowClassName = (modelNumber: string) => {
    if (selectedProduct?.modelNumber === modelNumber) {
      return 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-300';
    }
    if (matchedProducts.includes(modelNumber)) {
      return 'bg-green-50 border-green-200 shadow-sm ring-1 ring-green-200';
    }
    return 'bg-white hover:bg-gray-50 cursor-pointer';
  };

  const getMatchIcon = (modelNumber: string) => {
    if (selectedProduct?.modelNumber === modelNumber) {
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
    if (matchedProducts.includes(modelNumber)) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Database
          </h2>
          {matchedProducts.length > 0 && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              {matchedProducts.length} match{matchedProducts.length !== 1 ? 'es' : ''} found
            </div>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('modelNumber')}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Model Number
                  {sortBy === 'modelNumber' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Description
                  {sortBy === 'description' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Category
                  {sortBy === 'category' && (
                    <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">Price</th>
              <th className="px-6 py-4 text-left font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredProducts.map((product, index) => (
              <tr
                key={product.id}
                onClick={() => onProductSelect(product)}
                className={`border-b border-gray-200 transition-all duration-200 ${getRowClassName(product.modelNumber)}`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {product.modelNumber}
                    </span>
                    {getMatchIcon(product.modelNumber)}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{product.description}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.price}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredProducts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No products found matching your search.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};