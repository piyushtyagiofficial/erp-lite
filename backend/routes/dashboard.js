const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/reorder-suggestions - Get AI reorder suggestions
router.get('/reorder-suggestions', dashboardController.getReorderSuggestions);

// GET /api/dashboard/reports - Get inventory reports
router.get('/reports', dashboardController.getInventoryReports);

module.exports = router;