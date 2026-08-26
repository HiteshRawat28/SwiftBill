const express = require('express');
const { login, getMe, adminOnly } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.get('/admin-only', requireAuth, requireRole(['Admin']), adminOnly);

module.exports = router;
