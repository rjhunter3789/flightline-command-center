const Alert = require('../models/Alert');
const logger = require('../utils/logger');

class AlertService {
  async getActiveAlerts(dealershipId) {
    try {
      const alerts = await Alert.find({
        dealership: dealershipId,
        isActive: true,
        acknowledged: false
      })
        .populate('deal')
        .sort('-createdAt')
        .limit(50);

      return alerts;
    } catch (error) {
      logger.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  async createAlert(alertData) {
    try {
      const alert = await Alert.create(alertData);
      await alert.populate('deal');
      
      logger.info(`Alert created: ${alert._id} - ${alert.type}`);
      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  async acknowledgeAlert(alertId, userId) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date()
        },
        { new: true }
      );

      if (!alert) {
        throw new Error('Alert not found');
      }

      logger.info(`Alert acknowledged: ${alertId}`);
      return alert;
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  async checkDealAlerts(deal) {
    const alerts = [];
    const now = new Date();

    // Check for overdue test drive
    if (deal.stage === 'test_drive') {
      const stageEntry = deal.stageHistory.find(h => h.stage === 'test_drive');
      const duration = now - new Date(stageEntry.timestamp);
      
      if (duration > 45 * 60 * 1000) { // 45 minutes
        alerts.push({
          type: 'overdue_test_drive',
          message: `Test drive overdue - ${Math.round(duration / 60000)} minutes`,
          severity: 'warning',
          deal: deal._id,
          dealership: deal.dealership
        });
      }
    }

    // Check for stalled deals in finance
    if (deal.stage === 'finance') {
      const stageEntry = deal.stageHistory.find(h => h.stage === 'finance');
      const duration = now - new Date(stageEntry.timestamp);
      
      if (duration > 2 * 60 * 60 * 1000) { // 2 hours
        alerts.push({
          type: 'finance_delay',
          message: `Deal stalled in finance - ${Math.round(duration / 60000)} minutes`,
          severity: 'critical',
          deal: deal._id,
          dealership: deal.dealership
        });
      }
    }

    // Check for high urgency deals
    if (deal.urgency === 'critical' && deal.stage !== 'completed') {
      alerts.push({
        type: 'critical_deal',
        message: `Critical priority deal requires attention`,
        severity: 'critical',
        deal: deal._id,
        dealership: deal.dealership
      });
    }

    // Create alerts in database
    const createdAlerts = [];
    for (const alertData of alerts) {
      try {
        const existingAlert = await Alert.findOne({
          deal: alertData.deal,
          type: alertData.type,
          isActive: true
        });

        if (!existingAlert) {
          const alert = await this.createAlert(alertData);
          createdAlerts.push(alert);
        }
      } catch (error) {
        logger.error('Error creating alert:', error);
      }
    }

    return createdAlerts;
  }

  async getAlertStats(dealershipId) {
    try {
      const alerts = await Alert.find({ dealership: dealershipId });
      
      const stats = {
        total: alerts.length,
        active: alerts.filter(a => a.isActive && !a.acknowledged).length,
        acknowledged: alerts.filter(a => a.acknowledged).length,
        byType: {},
        bySeverity: {}
      };

      // Count by type
      alerts.forEach(alert => {
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
        stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error calculating alert stats:', error);
      throw error;
    }
  }

  // Automated alert checking (called by cron job)
  async runAlertChecks(dealershipId, io) {
    try {
      const Deal = require('../models/Deal');
      const deals = await Deal.find({
        dealership: dealershipId,
        isActive: true,
        stage: { $ne: 'completed' }
      });

      let newAlerts = [];
      for (const deal of deals) {
        const alerts = await this.checkDealAlerts(deal);
        newAlerts = newAlerts.concat(alerts);
      }

      // Broadcast new alerts
      if (newAlerts.length > 0 && io) {
        const { broadcastNewAlert } = require('./socketHandler');
        newAlerts.forEach(alert => {
          broadcastNewAlert(io, dealershipId, alert);
        });
      }

      logger.info(`Alert check completed for dealership ${dealershipId}: ${newAlerts.length} new alerts`);
      return newAlerts;
    } catch (error) {
      logger.error('Error running alert checks:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();