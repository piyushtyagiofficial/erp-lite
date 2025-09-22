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
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 shadow-large">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-primary-100 text-lg">
            Overview of your inventory management system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'from-primary-500 to-primary-600 text-white',
            warning: 'from-warning-500 to-warning-600 text-white',
            success: 'from-success-500 to-success-600 text-white',
          };
          
          return (
            <div key={index} className="stat-card group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-600 mb-2">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl lg:text-3xl font-bold text-secondary-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} shadow-medium group-hover:shadow-large transition-all duration-300`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">Low Stock Alert</h2>
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-success-600" />
              </div>
              <p className="text-secondary-600 font-medium">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-warning-50 to-warning-100 rounded-xl border border-warning-200 hover:shadow-medium transition-all duration-300">
                  <div>
                    <p className="font-semibold text-secondary-900">{product.name}</p>
                    <p className="text-sm text-secondary-600">SKU: {product.sku}</p>
                  </div>
                  <span className="badge-warning font-semibold">
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Reorder Suggestions */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">AI Reorder Suggestions</h2>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <button
                onClick={fetchReorderSuggestions}
                className="btn-secondary text-sm"
                disabled={loadingAI}
              >
                {loadingAI ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          {loadingAI ? (
            <div className="py-8">
              <LoadingSpinner text="Generating AI suggestions..." />
            </div>
          ) : reorderSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-secondary-600 font-medium">No reorder suggestions available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reorderSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-900">{suggestion.productName}</p>
                      <p className="text-sm text-secondary-600 mt-1">{suggestion.reason}</p>
                    </div>
                    <span className="badge-primary font-semibold ml-4">
                      Order (Quantity): {suggestion.suggestedQuantity}
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