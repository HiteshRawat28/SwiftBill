const express = require('express');
const { getTransactions, createTransaction } = require('../controllers/transaction.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', requireAuth, getTransactions);
// Only Admins and Accountants can record transactions
router.post('/', requireAuth, requireRole(['Admin', 'Accountant']), createTransaction);

module.exports = router;
