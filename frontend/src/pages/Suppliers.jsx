import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChartPieIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, PieChart, DoughnutChart } from '../components/charts';
import { suppliersService, productsService } from '../services/api';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
  });

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      toast.error('Error fetching suppliers');
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
      if (editingSupplier) {
        await suppliersService.update(editingSupplier._id, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await suppliersService.create(formData);
        toast.success('Supplier created successfully!');
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contactPerson: supplier.contactPerson || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersService.delete(id);
        toast.success('Supplier deleted successfully!');
        fetchSuppliers();
      } catch (error) {
        toast.error('Error deleting supplier');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
    });
  };

  // Analytics chart data preparation
  const getSupplierProductDistribution = () => {
    const supplierProducts = products.reduce((acc, product) => {
      const supplierName = product.supplier?.name || 'No Supplier';
      acc[supplierName] = (acc[supplierName] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(supplierProducts),
      values: Object.values(supplierProducts)
    };
  };

  const getSupplierStatus = () => {
    const statusCounts = suppliers.reduce((acc, supplier) => {
      const status = supplier.isActive ? 'Active' : 'Inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts)
    };
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your suppliers and vendor relationships
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Supplier
        </button>
      </div>

      {/* Supplier Analytics */}
      {suppliers.length > 0 && (
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Supplier Analytics</h2>
            <p className="text-secondary-600">Insights into supplier performance and relationships</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Product Distribution by Supplier */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Product Distribution by Supplier</h3>
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <PieChart 
                data={getSupplierProductDistribution()}
                title=""
                height={300}
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

            {/* Supplier Status Distribution */}
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Supplier Status</h3>
                <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <DoughnutChart 
                data={getSupplierStatus()}
                title=""
                height={300}
                centerText={{
                  value: suppliers.length.toString(),
                  label: 'Total Suppliers'
                }}
                colors={[
                  'rgba(16, 185, 129, 0.8)',  // Green for active
                  'rgba(239, 68, 68, 0.8)'    // Red for inactive
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
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="rounded-tl-lg">Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Products</th>
                <th className="rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-gray-50">
                  <td className="font-medium">{supplier.name}</td>
                  <td>{supplier.contactPerson || 'N/A'}</td>
                  <td>{supplier.email || 'N/A'}</td>
                  <td>{supplier.phone || 'N/A'}</td>
                  <td>{supplier.address || 'N/A'}</td>
                  <td>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                      {supplier.productsCount || 0} products
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
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
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No suppliers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
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
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {editingSupplier ? 'Update' : 'Create'} Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;