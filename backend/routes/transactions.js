const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET /api/transactions - Get all transactions
router.get('/', transactionController.getAllTransactions);

// GET /api/transactions/summary - Get transaction summary
router.get('/summary', transactionController.getTransactionSummary);

// GET /api/transactions/monthly-stats - Get monthly statistics
router.get('/monthly-stats', transactionController.getMonthlyStats);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

// POST /api/transactions - Create new transaction
router.post('/', transactionController.createTransaction);

module.exports = router;