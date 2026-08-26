const express = require('express');
const { generateInvoicePDF } = require('../controllers/invoice.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Allow all authenticated users (even Viewers) to download an invoice PDF
router.get('/:transactionId/pdf', requireAuth, generateInvoicePDF);

module.exports = router;
