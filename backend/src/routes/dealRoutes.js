const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { authenticate } = require('../middleware/auth');
const { validateDeal, validateDealUpdate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET /api/deals - Get all deals for a dealership
router.get('/', dealController.getDeals);

// GET /api/deals/active - Get active deals
router.get('/active', dealController.getActiveDeals);

// GET /api/deals/stats - Get dealership stats
router.get('/stats', dealController.getDealStats);

// GET /api/deals/:id - Get a specific deal
router.get('/:id', dealController.getDealById);

// POST /api/deals - Create a new deal
router.post('/', validateDeal, dealController.createDeal);

// PUT /api/deals/:id - Update a deal
router.put('/:id', validateDealUpdate, dealController.updateDeal);

// PATCH /api/deals/:id/stage - Update deal stage
router.patch('/:id/stage', dealController.updateDealStage);

// POST /api/deals/:id/action - Log an action on a deal
router.post('/:id/action', dealController.logDealAction);

// DELETE /api/deals/:id - Delete a deal (soft delete)
router.delete('/:id', dealController.deleteDeal);

// GET /api/deals/search - Search deals
router.get('/search', dealController.searchDeals);

module.exports = router;