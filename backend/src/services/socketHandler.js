const logger = require('../utils/logger');
const DealService = require('./dealService');
const AlertService = require('./alertService');

const socketHandler = (io, socket) => {
  // Join dealership room
  socket.on('join:dealership', async (dealershipId) => {
    try {
      socket.join(`dealership:${dealershipId}`);
      logger.info(`Socket ${socket.id} joined dealership:${dealershipId}`);
      
      // Send initial data
      const deals = await DealService.getActiveDealsByDealership(dealershipId);
      const alerts = await AlertService.getActiveAlerts(dealershipId);
      
      socket.emit('initial:data', {
        deals,
        alerts,
        stats: await DealService.getDealershipStats(dealershipId)
      });
    } catch (error) {
      logger.error('Error joining dealership room:', error);
      socket.emit('error', { message: 'Failed to join dealership' });
    }
  });

  // Deal updates
  socket.on('deal:update', async (data) => {
    try {
      const { dealId, updates, dealershipId } = data;
      const updatedDeal = await DealService.updateDeal(dealId, updates);
      
      // Broadcast to all clients in the dealership
      io.to(`dealership:${dealershipId}`).emit('deal:updated', updatedDeal);
      
      // Check for alerts based on the update
      const alerts = await AlertService.checkDealAlerts(updatedDeal);
      if (alerts.length > 0) {
        io.to(`dealership:${dealershipId}`).emit('alerts:new', alerts);
      }
    } catch (error) {
      logger.error('Error updating deal:', error);
      socket.emit('error', { message: 'Failed to update deal' });
    }
  });

  // Deal stage change
  socket.on('deal:stageChange', async (data) => {
    try {
      const { dealId, newStage, dealershipId } = data;
      const updatedDeal = await DealService.changeDealStage(dealId, newStage);
      
      io.to(`dealership:${dealershipId}`).emit('deal:stageChanged', {
        dealId,
        oldStage: data.oldStage,
        newStage,
        deal: updatedDeal
      });

      // Log the stage transition
      logger.info(`Deal ${dealId} moved from ${data.oldStage} to ${newStage}`);
    } catch (error) {
      logger.error('Error changing deal stage:', error);
      socket.emit('error', { message: 'Failed to change deal stage' });
    }
  });

  // Create new deal
  socket.on('deal:create', async (data) => {
    try {
      const newDeal = await DealService.createDeal(data);
      
      io.to(`dealership:${data.dealershipId}`).emit('deal:created', newDeal);
      
      logger.info(`New deal created: ${newDeal._id}`);
    } catch (error) {
      logger.error('Error creating deal:', error);
      socket.emit('error', { message: 'Failed to create deal' });
    }
  });

  // Handle actions (call, text, email)
  socket.on('action:trigger', async (data) => {
    try {
      const { action, dealId, dealershipId } = data;
      
      // Emit action to all clients for UI feedback
      io.to(`dealership:${dealershipId}`).emit('action:triggered', {
        action,
        dealId,
        timestamp: new Date(),
        triggeredBy: socket.id
      });

      // Log the action
      await DealService.logDealAction(dealId, action, socket.id);
      
      logger.info(`Action ${action} triggered for deal ${dealId}`);
    } catch (error) {
      logger.error('Error triggering action:', error);
      socket.emit('error', { message: 'Failed to trigger action' });
    }
  });

  // Alert acknowledgment
  socket.on('alert:acknowledge', async (data) => {
    try {
      const { alertId, dealershipId } = data;
      const updatedAlert = await AlertService.acknowledgeAlert(alertId, socket.id);
      
      io.to(`dealership:${dealershipId}`).emit('alert:acknowledged', updatedAlert);
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      socket.emit('error', { message: 'Failed to acknowledge alert' });
    }
  });

  // Real-time stats request
  socket.on('stats:request', async (dealershipId) => {
    try {
      const stats = await DealService.getDealershipStats(dealershipId);
      socket.emit('stats:update', stats);
    } catch (error) {
      logger.error('Error getting stats:', error);
      socket.emit('error', { message: 'Failed to get stats' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Heartbeat for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
};

// Broadcast functions for external triggers
const broadcastDealUpdate = (io, dealershipId, deal) => {
  io.to(`dealership:${dealershipId}`).emit('deal:updated', deal);
};

const broadcastNewAlert = (io, dealershipId, alert) => {
  io.to(`dealership:${dealershipId}`).emit('alert:new', alert);
};

const broadcastStatsUpdate = (io, dealershipId, stats) => {
  io.to(`dealership:${dealershipId}`).emit('stats:update', stats);
};

module.exports = socketHandler;
module.exports.broadcastDealUpdate = broadcastDealUpdate;
module.exports.broadcastNewAlert = broadcastNewAlert;
module.exports.broadcastStatsUpdate = broadcastStatsUpdate;