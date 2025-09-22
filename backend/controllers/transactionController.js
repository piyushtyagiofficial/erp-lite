const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Joi = require('joi');
const mongoose = require('mongoose');

// Validation schema
const transactionSchema = Joi.object({
  type: Joi.string().required().valid('purchase', 'sale'),
  product: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  quantity: Joi.number().required().min(1),
  price: Joi.number().required().min(0),
  totalAmount: Joi.number().min(0).optional(), // Optional, will be calculated if not provided
  supplier: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(''),
  customer: Joi.string().max(100).trim().allow(''),
  invoiceNumber: Joi.string().max(50).trim().allow(''),
  notes: Joi.string().max(300).trim().allow('')
});

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { type, product, dateFrom, dateTo, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by type
    if (type && ['purchase', 'sale'].includes(type)) {
      query.type = type;
    }
    
    // Filter by product
    if (product) {
      query.product = product;
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .populate('product', 'name sku')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name sku description')
      .populate('supplier', 'name contactPerson');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Validate request body
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message)
      });
    }
    
    // Check if product exists
    const product = await Product.findById(value.product).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check stock for sales
    if (value.type === 'sale' && product.quantity < value.quantity) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${value.quantity}` 
      });
    }
    
    // Create transaction
    const transaction = new Transaction(value);
    const savedTransaction = await transaction.save({ session });
    
    // Update product quantity based on transaction type
    let quantityChange;
    if (value.type === 'purchase') {
      quantityChange = value.quantity; // Add to stock
    } else if (value.type === 'sale') {
      quantityChange = -value.quantity; // Remove from stock
    }
    
    await Product.findByIdAndUpdate(
      value.product,
      { $inc: { quantity: quantityChange } },
      { session }
    );
    
    await session.commitTransaction();
    
    // Get populated transaction
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('product', 'name sku')
      .populate('supplier', 'name');
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let matchQuery = {};
    if (dateFrom || dateTo) {
      matchQuery.createdAt = {};
      if (dateFrom) {
        matchQuery.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        matchQuery.createdAt.$lte = new Date(dateTo);
      }
    }
    
    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);
    
    const result = {
      purchases: summary.find(s => s._id === 'purchase') || { totalTransactions: 0, totalAmount: 0, totalQuantity: 0 },
      sales: summary.find(s => s._id === 'sale') || { totalTransactions: 0, totalAmount: 0, totalQuantity: 0 }
    };
    
    // Calculate profit (simplified - sales revenue minus purchase cost)
    result.grossProfit = result.sales.totalAmount - result.purchases.totalAmount;
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ message: 'Error fetching transaction summary', error: error.message });
  }
};

// Get monthly transaction stats
exports.getMonthlyStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          totalAmount: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 24 // Last 12 months for both types
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ message: 'Error fetching monthly stats', error: error.message });
  }
};