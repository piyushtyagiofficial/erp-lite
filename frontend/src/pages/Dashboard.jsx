import React, { useState, useEffect } from 'react';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchReorderSuggestions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data.stats);
      setLowStockProducts(data.lowStockProducts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReorderSuggestions = async () => {
    setLoadingAI(true);
    try {
      const suggestions = await dashboardService.getReorderSuggestions();
      setReorderSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching reorder suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'primary',
    },
    {
      name: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: ExclamationTriangleIcon,
      color: 'warning',
    },
    {
      name: 'Total Inventory Value',
      value: `$${stats.totalInventoryValue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'success',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 text-${stat.color} ${stat.color === 'primary' ? 'text-primary-600' : stat.color === 'warning' ? 'text-warning' : 'text-success'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Low Stock Alert</h2>
            <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">All products are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-warning bg-opacity-10 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning text-white">
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Reorder Suggestions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">AI Reorder Suggestions</h2>
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-primary-600 mr-1" />
              <button
                onClick={fetchReorderSuggestions}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                disabled={loadingAI}
              >
                {loadingAI ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          {loadingAI ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : reorderSuggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reorder suggestions available</p>
          ) : (
            <div className="space-y-3">
              {reorderSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{suggestion.productName}</p>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                      Order {suggestion.suggestedQuantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;