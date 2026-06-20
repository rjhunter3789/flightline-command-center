const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/customers - Get all customers for a dealership
router.get('/', customerController.getCustomers);

// GET /api/customers/:id - Get a specific customer
router.get('/:id', customerController.getCustomerById);

// POST /api/customers - Create a new customer
router.post('/', customerController.createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', customerController.updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', customerController.deleteCustomer);

// GET /api/customers/:id/deals - Get all deals for a customer
router.get('/:id/deals', customerController.getCustomerDeals);

// GET /api/customers/search - Search customers
router.get('/search', customerController.searchCustomers);

module.exports = router;