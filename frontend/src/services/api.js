import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Suppliers API
export const suppliersService = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },
  
  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },
  
  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};

// Transactions API
export const transactionsService = {
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
};


// Dashboard API
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getReorderSuggestions: async () => {
    const response = await api.get('/dashboard/reorder-suggestions');
    return response.data;
  },
};

export default api;