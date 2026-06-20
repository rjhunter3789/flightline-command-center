const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/alerts - Get all alerts for a dealership
router.get('/', alertController.getAlerts);

// GET /api/alerts/active - Get active alerts
router.get('/active', alertController.getActiveAlerts);

// POST /api/alerts - Create a new alert
router.post('/', alertController.createAlert);

// PATCH /api/alerts/:id/acknowledge - Acknowledge an alert
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', alertController.deleteAlert);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', alertController.getAlertStats);

module.exports = router;