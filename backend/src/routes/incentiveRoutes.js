 const express = require('express');
  const router = express.Router();
  const Incentive = require('../models/Incentive');
  const logger = require('../utils/logger');

  // Get all active incentives
  router.get('/', async (req, res) => {
    try {
      const incentives = await Incentive.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      res.json({
        success: true,
        data: incentives
      });
    } catch (error) {
      logger.error('Error fetching incentives:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch incentives' });
    }
  });

  // Search incentives for a specific vehicle
  router.post('/search', async (req, res) => {
    try {
      const { vehicle } = req.body;

      const incentives = await Incentive.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        manufacturer: new RegExp(vehicle.make, 'i'),
        $or: [
          { modelYears: { $size: 0 } },
          { modelYears: vehicle.year }
        ],
        $or: [
          { models: { $size: 0 } },
          { models: new RegExp(vehicle.model, 'i') }
        ]
      });

      const totalSavings = incentives
        .filter(i => i.type === 'cash_rebate' && i.stackable)
        .reduce((sum, i) => sum + i.cashAmount, 0);

      res.json({
        success: true,
        data: {
          eligible: incentives,
          totalPossibleSavings: totalSavings
        }
      });
    } catch (error) {
      logger.error('Error searching incentives:', error);
      res.status(500).json({ success: false, error: 'Failed to search incentives' });
    }
  });

  // Create new incentive (temporary - for testing)
  router.post('/create', async (req, res) => {
    try {
      const incentive = new Incentive({
        ...req.body,
        createdBy: 'admin'
      });

      await incentive.save();

      res.json({
        success: true,
        data: incentive
      });
    } catch (error) {
      logger.error('Error creating incentive:', error);
      res.status(500).json({ success: false, error: 'Failed to create incentive' });
    }
  });

  module.exports = router;
