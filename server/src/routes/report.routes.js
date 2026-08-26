const express = require('express');
const { 
  getDashboardStats, 
  getSalesSummary, 
  getGstLiability, 
  getStockValuation 
} = require('../controllers/report.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Only Admins and Accountants can view reports
router.use(requireAuth);
router.use(requireRole(['Admin', 'Accountant', 'Viewer'])); // Let Viewer see reports as well, per RBAC definition!

router.get('/dashboard-stats', getDashboardStats);
router.get('/sales-summary', getSalesSummary);
router.get('/gst-liability', getGstLiability);
router.get('/stock-valuation', getStockValuation);

module.exports = router;
