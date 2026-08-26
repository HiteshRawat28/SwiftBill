const express = require('express');
const { getCategories, createCategory, getUnits, createUnit } = require('../controllers/lookup.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/categories', requireAuth, getCategories);
router.post('/categories', requireAuth, requireRole(['Admin', 'Accountant']), createCategory);

router.get('/units', requireAuth, getUnits);
router.post('/units', requireAuth, requireRole(['Admin', 'Accountant']), createUnit);

module.exports = router;
