const Alert = require('../models/Alert');
const logger = require('../utils/logger');

class AlertController {
  async getAlerts(req, res) {
    try {
      const { page = 1, limit = 50, type, severity, acknowledged } = req.query;
      const query = { dealership: req.dealershipId };

      if (type) query.type = type;
      if (severity) query.severity = severity;
      if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';

      const alerts = await Alert.find(query)
        .populate('deal')
        .populate('acknowledgedBy', 'firstName lastName')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Alert.countDocuments(query);

      res.json({
        success: true,
        data: alerts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch alerts'
      });
    }
  }

  async getActiveAlerts(req, res) {
    try {
      const alerts = await Alert.find({
        dealership: req.dealershipId,
        isActive: true,
        acknowledged: false
      })
        .populate('deal')
        .sort({ severity: -1, createdAt: -1 })
        .limit(100);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Error fetching active alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active alerts'
      });
    }
  }

  async createAlert(req, res) {
    try {
      const alertData = {
        ...req.body,
        dealership: req.dealershipId
      };

      const alert = await Alert.create(alertData);
      await alert.populate('deal');

      // Broadcast via WebSocket
      const io = req.app.get('io');
      if (io) {
        const { broadcastNewAlert } = require('../services/socketHandler');
        broadcastNewAlert(io, req.dealershipId, alert);
      }

      res.status(201).json({
        success: true,
        data: alert
      });
    } catch (error) {
      logger.error('Error creating alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create alert'
      });
    }
  }

  async acknowledgeAlert(req, res) {
    try {
      const alert = await Alert.findOneAndUpdate(
        {
          _id: req.params.id,
          dealership: req.dealershipId
        },
        {
          acknowledged: true,
          acknowledgedBy: req.user._id,
          acknowledgedAt: new Date()
        },
        { new: true }
      ).populate('deal');

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      // Broadcast via WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(`dealership:${req.dealershipId}`).emit('alert:acknowledged', alert);
      }

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to acknowledge alert'
      });
    }
  }

  async deleteAlert(req, res) {
    try {
      const alert = await Alert.findOneAndUpdate(
        {
          _id: req.params.id,
          dealership: req.dealershipId
        },
        { isActive: false },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete alert'
      });
    }
  }

  async getAlertStats(req, res) {
    try {
      const AlertService = require('../services/alertService');
      const stats = await AlertService.getAlertStats(req.dealershipId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching alert stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch alert statistics'
      });
    }
  }
}

module.exports = new AlertController();