const Dealership = require('../models/Dealership');
const User = require('../models/User');
const logger = require('../utils/logger');

class DealershipController {
  async getDealerships(req, res) {
    try {
      const dealerships = await Dealership.find({ isActive: true })
        .select('-integrations.dms.apiSecret -integrations.crm.apiSecret');

      res.json({
        success: true,
        data: dealerships
      });
    } catch (error) {
      logger.error('Error fetching dealerships:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dealerships'
      });
    }
  }

  async getDealershipById(req, res) {
    try {
      const dealership = await Dealership.findById(req.params.id)
        .select('-integrations.dms.apiSecret -integrations.crm.apiSecret');

      if (!dealership) {
        return res.status(404).json({
          success: false,
          error: 'Dealership not found'
        });
      }

      res.json({
        success: true,
        data: dealership
      });
    } catch (error) {
      logger.error('Error fetching dealership:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dealership'
      });
    }
  }

  async createDealership(req, res) {
    try {
      const dealership = await Dealership.create(req.body);

      res.status(201).json({
        success: true,
        data: dealership
      });
    } catch (error) {
      logger.error('Error creating dealership:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create dealership'
      });
    }
  }

  async updateDealership(req, res) {
    try {
      // Remove sensitive fields from update
      delete req.body.code;
      delete req.body.subscription;

      const dealership = await Dealership.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!dealership) {
        return res.status(404).json({
          success: false,
          error: 'Dealership not found'
        });
      }

      res.json({
        success: true,
        data: dealership
      });
    } catch (error) {
      logger.error('Error updating dealership:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update dealership'
      });
    }
  }

  async deleteDealership(req, res) {
    try {
      const dealership = await Dealership.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!dealership) {
        return res.status(404).json({
          success: false,
          error: 'Dealership not found'
        });
      }

      // Deactivate all users
      await User.updateMany(
        { dealership: req.params.id },
        { isActive: false }
      );

      res.json({
        success: true,
        message: 'Dealership deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting dealership:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete dealership'
      });
    }
  }

  async getDealershipUsers(req, res) {
    try {
      const users = await User.find({
        dealership: req.params.id,
        isActive: true
      })
        .select('-password -refreshTokens')
        .sort({ role: 1, lastName: 1 });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Error fetching dealership users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }

  async getDealershipSettings(req, res) {
    try {
      const dealership = await Dealership.findById(req.params.id)
        .select('settings branding timezone businessHours');

      if (!dealership) {
        return res.status(404).json({
          success: false,
          error: 'Dealership not found'
        });
      }

      res.json({
        success: true,
        data: dealership
      });
    } catch (error) {
      logger.error('Error fetching dealership settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      });
    }
  }

  async updateDealershipSettings(req, res) {
    try {
      const { settings, branding, timezone, businessHours } = req.body;

      const dealership = await Dealership.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...(settings && { settings }),
            ...(branding && { branding }),
            ...(timezone && { timezone }),
            ...(businessHours && { businessHours })
          }
        },
        { new: true }
      ).select('settings branding timezone businessHours');

      if (!dealership) {
        return res.status(404).json({
          success: false,
          error: 'Dealership not found'
        });
      }

      res.json({
        success: true,
        data: dealership
      });
    } catch (error) {
      logger.error('Error updating dealership settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings'
      });
    }
  }
}

module.exports = new DealershipController();