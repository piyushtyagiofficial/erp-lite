const Product = require('../models/Product');
const Joi = require('joi');

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().required().max(100).trim(),
  sku: Joi.string().required().max(50).trim(),
  description: Joi.string().max(500).trim().allow(''),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  minStockLevel: Joi.number().min(0).default(10),
  supplier: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(''),
  category: Joi.string().max(50).trim().allow(''),
});

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, supplier, category, stockStatus } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by supplier
    if (supplier) {
      query.supplier = supplier;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .populate('supplier', 'name contactPerson')
      .sort({ createdAt: -1 });
    
    // Filter by stock status if requested
    let filteredProducts = products;
    if (stockStatus) {
      filteredProducts = products.filter(product => product.stockStatus === stockStatus);
    }
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name contactPerson email phone');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message)
      });
    }
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: value.sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    
    const product = new Product({
      ...value,
      sku: value.sku.toUpperCase()
    });
    
    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('supplier', 'name contactPerson');
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message)
      });
    }
    
    // Check if product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if SKU is being changed and if it conflicts
    if (value.sku.toUpperCase() !== existingProduct.sku) {
      const skuConflict = await Product.findOne({ 
        sku: value.sku.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (skuConflict) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...value, sku: value.sku.toUpperCase() },
      { new: true, runValidators: true }
    ).populate('supplier', 'name contactPerson');
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Soft delete - mark as inactive instead of removing
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    })
    .populate('supplier', 'name contactPerson')
    .sort({ quantity: 1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
  }
};