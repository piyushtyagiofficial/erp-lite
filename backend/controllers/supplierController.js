const Supplier = require('../models/Supplier.js');
const Product = require('../models/Product');
const Joi = require('joi');

// Validation schema
const supplierSchema = Joi.object({
  name: Joi.string().required().max(100).trim(),
  contactPerson: Joi.string().max(100).trim().allow(''),
  email: Joi.string().email().allow(''),
  phone: Joi.string().max(20).trim().allow(''),
  address: Joi.string().max(300).trim().allow(''),
  website: Joi.string().max(200).trim().allow(''),
  taxId: Joi.string().max(50).trim().allow(''),
  paymentTerms: Joi.string().max(100).trim().allow(''),
  rating: Joi.number().min(1).max(5).allow(null),
  notes: Joi.string().max(500).trim().allow('')
});

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const suppliers = await Supplier.find(query)
      .populate('productsCount')
      .sort({ createdAt: -1 });
    
    // Get products count for each supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productsCount = await Product.countDocuments({ 
          supplier: supplier._id, 
          isActive: true 
        });
        return {
          ...supplier.toJSON(),
          productsCount
        };
      })
    );
    
    res.json(suppliersWithCount);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Get products for this supplier
    const products = await Product.find({ 
      supplier: supplier._id, 
      isActive: true 
    }).select('name sku quantity price');
    
    const supplierWithProducts = {
      ...supplier.toJSON(),
      products
    };
    
    res.json(supplierWithProducts);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Error fetching supplier', error: error.message });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = supplierSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message)
      });
    }
    
    // Check if supplier name already exists
    const existingSupplier = await Supplier.findOne({ 
      name: { $regex: new RegExp('^' + value.name + '$', 'i') },
      isActive: true
    });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this name already exists' });
    }
    
    const supplier = new Supplier(value);
    const savedSupplier = await supplier.save();
    
    res.status(201).json({
      ...savedSupplier.toJSON(),
      productsCount: 0
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = supplierSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message)
      });
    }
    
    // Check if supplier exists
    const existingSupplier = await Supplier.findById(req.params.id);
    if (!existingSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Check if name is being changed and if it conflicts
    if (value.name.toLowerCase() !== existingSupplier.name.toLowerCase()) {
      const nameConflict = await Supplier.findOne({ 
        name: { $regex: new RegExp('^' + value.name + '$', 'i') },
        _id: { $ne: req.params.id },
        isActive: true
      });
      if (nameConflict) {
        return res.status(400).json({ message: 'Supplier with this name already exists' });
      }
    }
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );
    
    // Get products count
    const productsCount = await Product.countDocuments({ 
      supplier: supplier._id, 
      isActive: true 
    });
    
    res.json({
      ...supplier.toJSON(),
      productsCount
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Check if supplier has products
    const productsCount = await Product.countDocuments({ 
      supplier: req.params.id, 
      isActive: true 
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete supplier with associated products. Please remove or reassign products first.' 
      });
    }
    
    // Soft delete - mark as inactive
    await Supplier.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
};

// Get suppliers grouped by product count
exports.getSupplierStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      {
        $unwind: {
          path: '$supplierInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$supplier',
          supplierName: { $first: '$supplierInfo.name' },
          productCount: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      {
        $sort: { productCount: -1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    res.status(500).json({ message: 'Error fetching supplier stats', error: error.message });
  }
};