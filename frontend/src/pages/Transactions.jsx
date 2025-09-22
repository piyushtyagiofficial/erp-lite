import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, PieChart, LineChart, DoughnutChart } from '../components/charts';
import { transactionsService, productsService } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    type: 'purchase',
    product: '',
    quantity: '',
    price: '',
    notes: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

const fetchTransactions = async () => {
  try {
    const data = await transactionsService.getAll();
    setTransactions(data.transactions); // ✅ only set the array, not the whole object
  } catch (error) {
    toast.error('Error fetching transactions');
  } finally {
    setLoading(false);
  }
};


  const fetchProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionsService.create(formData);
      toast.success('Transaction created successfully!');
      fetchTransactions();
      fetchProducts(); // Refresh products to update quantities
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving transaction');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      type: 'purchase',
      product: '',
      quantity: '',
      price: '',
      notes: '',
    });
  };

  // Analytics chart data preparation
  const getTransactionTypeData = () => {
    const typeCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(typeCounts).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      values: Object.values(typeCounts)
    };
  };

  const getMonthlyTransactionTrends = () => {
    if (!transactions.length) {
      return {
        labels: ['No Data'],
        datasets: [
          { label: 'Sales', values: [0] },
          { label: 'Purchases', values: [0] }
        ]
      };
    }

    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { sales: 0, purchases: 0, salesAmount: 0, purchasesAmount: 0 };
      }
      
      if (transaction.type === 'sale') {
        acc[monthKey].sales++;
        acc[monthKey].salesAmount += transaction.totalAmount || (transaction.quantity * transaction.price);
      } else {
        acc[monthKey].purchases++;
        acc[monthKey].purchasesAmount += transaction.totalAmount || (transaction.quantity * transaction.price);
      }
      
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Sales Count',
          values: sortedMonths.map(month => monthlyData[month].sales)
        },
        {
          label: 'Purchases Count',
          values: sortedMonths.map(month => monthlyData[month].purchases)
        }
      ]
    };
  };

  const getRevenueVsCostData = () => {
    const monthlyRevenue = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { revenue: 0, cost: 0 };
      }
      
      const amount = transaction.totalAmount || (transaction.quantity * transaction.price);
      if (transaction.type === 'sale') {
        acc[monthKey].revenue += amount;
      } else {
        acc[monthKey].cost += amount;
      }
      
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          values: sortedMonths.map(month => monthlyRevenue[month].revenue)
        },
        {
          label: 'Cost ($)',
          values: sortedMonths.map(month => monthlyRevenue[month].cost)
        }
      ]
    };
  };

  const getTopProductsData = () => {
    const productStats = transactions.reduce((acc, transaction) => {
      const productName = transaction.product?.name || 'Unknown Product';
      if (!acc[productName]) {
        acc[productName] = { sales: 0, purchases: 0, totalVolume: 0 };
      }
      
      if (transaction.type === 'sale') {
        acc[productName].sales += transaction.quantity;
      } else {
        acc[productName].purchases += transaction.quantity;
      }
      acc[productName].totalVolume += transaction.quantity;
      
      return acc;
    }, {});

    const sortedProducts = Object.entries(productStats)
      .sort(([,a], [,b]) => b.totalVolume - a.totalVolume)
      .slice(0, 10);

    return {
      labels: sortedProducts.map(([name]) => name),
      values: sortedProducts.map(([,stats]) => stats.totalVolume),
      label: 'Total Volume'
    };
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all inventory transactions and movements
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Transaction
        </button>
      </div>

      {/* Transaction Analytics */}
      {transactions.length > 0 && (
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Transaction Analytics</h2>
            <p className="text-secondary-600">Visual insights into your transaction patterns and trends</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Transaction Type Distribution */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Transaction Type Distribution</h3>
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <PieChart 
                data={getTransactionTypeData()}
                title=""
                height={300}
                colors={[
                  'rgba(16, 185, 129, 0.8)',  // Green for sales
                  'rgba(79, 70, 229, 0.8)'    // Purple for purchases
                ]}
              />
            </div>

            {/* Monthly Transaction Trends */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Monthly Transaction Trends</h3>
                <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <LineChart 
                data={getMonthlyTransactionTrends()}
                title=""
                height={300}
                colors={[
                  'rgba(16, 185, 129, 1)',   // Green for sales
                  'rgba(79, 70, 229, 1)'     // Purple for purchases
                ]}
              />
            </div>

            {/* Revenue vs Cost Analysis */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Revenue vs Cost Analysis</h3>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <BarChart 
                data={getRevenueVsCostData()}
                title=""
                height={300}
                backgroundColor={[
                  'rgba(16, 185, 129, 0.8)',  // Green for revenue
                  'rgba(239, 68, 68, 0.8)'    // Red for cost
                ]}
              />
            </div>

            {/* Top Products by Volume */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Top Products by Transaction Volume</h3>
                <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <BarChart 
                data={getTopProductsData()}
                title=""
                height={300}
                backgroundColor={[
                  'rgba(79, 70, 229, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(34, 197, 94, 0.8)',
                  'rgba(251, 146, 60, 0.8)',
                  'rgba(168, 85, 247, 0.8)'
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="rounded-tl-lg">Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th className="rounded-tr-lg">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type === 'purchase' ? 'Purchase' : 'Sale'}
                    </span>
                  </td>
                  <td className="font-medium">
                    {transaction.product?.name || 'N/A'}
                  </td>
                  <td>{transaction.quantity}</td>
                  <td>${transaction.price}</td>
                  <td className="font-medium">
                    ${(transaction.quantity * transaction.price).toFixed(2)}
                  </td>
                  <td>{transaction.notes || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
            >
              <option value="purchase">Purchase (Stock In)</option>
              <option value="sale">Sale (Stock Out)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              required
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="input"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} (SKU: {product.sku}) - Stock: {product.quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {formData.quantity && formData.price && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Total Amount: <span className="font-medium text-gray-900">
                  ${(parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              placeholder="Add any additional notes..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;