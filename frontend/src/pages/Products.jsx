import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChartPieIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, PieChart, DoughnutChart } from '../components/charts';
import { productsService, suppliersService } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
    supplier: '',
    description: '',
    minStockLevel: '10',
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsService.update(editingProduct._id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productsService.create(formData);
        toast.success('Product created successfully!');
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      supplier: product.supplier?._id || '',
      description: product.description || '',
      minStockLevel: product.minStockLevel?.toString() || '10',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsService.delete(id);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  // Analytics chart data preparation
  const getStockLevelsData = () => {
    const stockCategories = products.reduce((acc, product) => {
      if (product.quantity === 0) {
        acc.outOfStock++;
      } else if (product.quantity <= product.minStockLevel) {
        acc.lowStock++;
      } else if (product.quantity <= product.minStockLevel * 2) {
        acc.mediumStock++;
      } else {
        acc.highStock++;
      }
      return acc;
    }, { outOfStock: 0, lowStock: 0, mediumStock: 0, highStock: 0 });

    return {
      labels: ['Out of Stock', 'Low Stock', 'Medium Stock', 'Well Stocked'],
      values: [stockCategories.outOfStock, stockCategories.lowStock, stockCategories.mediumStock, stockCategories.highStock]
    };
  };

  const getSupplierDistributionData = () => {
    const supplierCounts = products.reduce((acc, product) => {
      const supplierName = product.supplier?.name || 'No Supplier';
      acc[supplierName] = (acc[supplierName] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(supplierCounts),
      values: Object.values(supplierCounts)
    };
  };

  const getInventoryValueData = () => {
    const sortedProducts = [...products]
      .map(product => ({
        name: product.name,
        value: product.quantity * product.price
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 by value

    return {
      labels: sortedProducts.map(p => p.name),
      values: sortedProducts.map(p => p.value),
      label: 'Inventory Value ($)'
    };
  };

  const getPriceRangeData = () => {
    const priceRanges = products.reduce((acc, product) => {
      const price = product.price;
      if (price < 10) {
        acc.under10++;
      } else if (price < 50) {
        acc.under50++;
      } else if (price < 100) {
        acc.under100++;
      } else if (price < 500) {
        acc.under500++;
      } else {
        acc.over500++;
      }
      return acc;
    }, { under10: 0, under50: 0, under100: 0, under500: 0, over500: 0 });

    return {
      labels: ['Under $10', '$10-$50', '$50-$100', '$100-$500', 'Over $500'],
      values: [priceRanges.under10, priceRanges.under50, priceRanges.under100, priceRanges.under500, priceRanges.over500]
    };
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      price: '',
      quantity: '',
      supplier: '',
      description: '',
      minStockLevel: '10',
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Analytics Charts */}
      {products.length > 0 && (
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Product Analytics</h2>
            <p className="text-secondary-600">Visual insights into your product inventory</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Stock Level Distribution */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Stock Level Distribution</h3>
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <PieChart 
                data={getStockLevelsData()}
                title=""
                height={300}
                colors={[
                  'rgba(239, 68, 68, 0.8)',   // Red for out of stock
                  'rgba(245, 158, 11, 0.8)',  // Orange for low stock
                  'rgba(59, 130, 246, 0.8)',  // Blue for medium stock
                  'rgba(16, 185, 129, 0.8)'   // Green for well stocked
                ]}
              />
            </div>

            {/* Top Products by Value */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Top Products by Inventory Value</h3>
                <div className="p-3 bg-gradient-to-br from-success-500 to-success-600 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <BarChart 
                data={getInventoryValueData()}
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

            {/* Supplier Distribution */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Products by Supplier</h3>
                <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
                  <CubeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <DoughnutChart 
                data={getSupplierDistributionData()}
                title=""
                height={300}
                centerText={{
                  value: products.length.toString(),
                  label: 'Total Products'
                }}
                colors={[
                  'rgba(79, 70, 229, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(34, 197, 94, 0.8)'
                ]}
              />
            </div>

            {/* Price Range Distribution */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Price Range Distribution</h3>
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <BarChart 
                data={getPriceRangeData()}
                title=""
                height={300}
                backgroundColor={[
                  'rgba(34, 197, 94, 0.8)',   // Green for low prices
                  'rgba(59, 130, 246, 0.8)',  // Blue
                  'rgba(139, 92, 246, 0.8)',  // Purple  
                  'rgba(245, 158, 11, 0.8)',  // Orange
                  'rgba(239, 68, 68, 0.8)'    // Red for high prices
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="rounded-tl-lg">Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Status</th>
                <th className="rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="font-medium">{product.name}</td>
                  <td>{product.sku}</td>
                  <td>${product.price}</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.quantity <= (product.minStockLevel || 10)
                        ? 'bg-red-100 text-red-800'
                        : product.quantity <= (product.minStockLevel || 10) * 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td>{product.supplier?.name || 'N/A'}</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.quantity <= (product.minStockLevel || 10)
                        ? 'bg-red-100 text-red-800'
                        : product.quantity <= (product.minStockLevel || 10) * 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.quantity <= (product.minStockLevel || 10) ? 'Low Stock' : 
                       product.quantity <= (product.minStockLevel || 10) * 2 ? 'Medium Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="input"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
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
              {editingProduct ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;