const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['purchase', 'sale'],
    lowercase: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: false // Will be calculated automatically in pre-save middleware
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  customer: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  invoiceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Invoice number cannot exceed 50 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
transactionSchema.pre('save', function(next) {
  // Always calculate totalAmount to ensure accuracy
  this.totalAmount = this.quantity * this.price;
  next();
});

// Indexes for performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ product: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);