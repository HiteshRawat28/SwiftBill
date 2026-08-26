const express = require('express');
const { getParties, createParty, updateParty, deleteParty } = require('../controllers/party.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', requireAuth, getParties);
router.post('/', requireAuth, requireRole(['Admin', 'Accountant']), createParty);
router.put('/:id', requireAuth, requireRole(['Admin', 'Accountant']), updateParty);
router.delete('/:id', requireAuth, requireRole(['Admin', 'Accountant']), deleteParty);

module.exports = router;
