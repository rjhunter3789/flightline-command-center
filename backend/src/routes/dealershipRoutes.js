const express = require('express');
const router = express.Router();
const dealershipController = require('../controllers/dealershipController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/dealerships - Get all dealerships (admin only)
router.get('/', authorize(['admin']), dealershipController.getDealerships);

// GET /api/dealerships/:id - Get a specific dealership
router.get('/:id', dealershipController.getDealershipById);

// POST /api/dealerships - Create a new dealership (admin only)
router.post('/', authorize(['admin']), dealershipController.createDealership);

// PUT /api/dealerships/:id - Update a dealership
router.put('/:id', authorize(['admin', 'manager']), dealershipController.updateDealership);

// DELETE /api/dealerships/:id - Delete a dealership (admin only)
router.delete('/:id', authorize(['admin']), dealershipController.deleteDealership);

// GET /api/dealerships/:id/users - Get all users for a dealership
router.get('/:id/users', dealershipController.getDealershipUsers);

// GET /api/dealerships/:id/settings - Get dealership settings
router.get('/:id/settings', dealershipController.getDealershipSettings);

// PUT /api/dealerships/:id/settings - Update dealership settings
router.put('/:id/settings', authorize(['admin', 'manager']), dealershipController.updateDealershipSettings);

module.exports = router;