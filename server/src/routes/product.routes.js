const express = require('express');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

// All roles can view products
router.get('/', requireAuth, getProducts);

// Only Admins and Accountants can modify products
router.post('/', requireAuth, requireRole(['Admin', 'Accountant']), createProduct);
router.put('/:id', requireAuth, requireRole(['Admin', 'Accountant']), updateProduct);
router.delete('/:id', requireAuth, requireRole(['Admin', 'Accountant']), deleteProduct);

module.exports = router;
