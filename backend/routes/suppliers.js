const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController.js');

// GET /api/suppliers - Get all suppliers
router.get('/', supplierController.getAllSuppliers);

// GET /api/suppliers/stats - Get supplier statistics
router.get('/stats', supplierController.getSupplierStats);

// GET /api/suppliers/:id - Get supplier by ID
router.get('/:id', supplierController.getSupplierById);

// POST /api/suppliers - Create new supplier
router.post('/', supplierController.createSupplier);

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', supplierController.updateSupplier);

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;