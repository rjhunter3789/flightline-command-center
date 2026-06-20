const DealService = require('../services/dealService');
const logger = require('../utils/logger');

class DealController {
  async getDeals(req, res) {
    try {
      const deals = await DealService.searchDeals(req.dealershipId, req.query);
      
      res.json({
        success: true,
        count: deals.length,
        data: deals
      });
    } catch (error) {
      logger.error('Error in getDeals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deals'
      });
    }
  }

  async getActiveDeals(req, res) {
    try {
      const deals = await DealService.getActiveDealsByDealership(req.dealershipId);
      
      res.json({
        success: true,
        count: deals.length,
        data: deals
      });
    } catch (error) {
      logger.error('Error in getActiveDeals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active deals'
      });
    }
  }

  async getDealById(req, res) {
    try {
      const deal = await DealService.getDealById(req.params.id);
      
      if (!deal) {
        return res.status(404).json({
          success: false,
          error: 'Deal not found'
        });
      }

      // Ensure user can only access deals from their dealership
      if (deal.dealership.toString() !== req.dealershipId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: deal
      });
    } catch (error) {
      logger.error('Error in getDealById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deal'
      });
    }
  }

  async createDeal(req, res) {
    try {
      const dealData = {
        ...req.body,
        dealershipId: req.dealershipId,
        salesRep: req.user._id
      };

      const deal = await DealService.createDeal(dealData);

      // Broadcast to WebSocket clients
      const io = req.app.get('io');
      if (io) {
        const { broadcastDealUpdate } = require('../services/socketHandler');
        broadcastDealUpdate(io, req.dealershipId, deal);
      }

      res.status(201).json({
        success: true,
        data: deal
      });
    } catch (error) {
      logger.error('Error in createDeal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create deal'
      });
    }
  }

  async updateDeal(req, res) {
    try {
      const deal = await DealService.updateDeal(req.params.id, req.body);

      // Broadcast to WebSocket clients
      const io = req.app.get('io');
      if (io) {
        const { broadcastDealUpdate } = require('../services/socketHandler');
        broadcastDealUpdate(io, req.dealershipId, deal);
      }

      res.json({
        success: true,
        data: deal
      });
    } catch (error) {
      logger.error('Error in updateDeal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update deal'
      });
    }
  }

  async updateDealStage(req, res) {
    try {
      const { stage } = req.body;
      
      if (!stage) {
        return res.status(400).json({
          success: false,
          error: 'Stage is required'
        });
      }

      const deal = await DealService.changeDealStage(req.params.id, stage);

      // Broadcast to WebSocket clients
      const io = req.app.get('io');
      if (io) {
        io.to(`dealership:${req.dealershipId}`).emit('deal:stageChanged', {
          dealId: deal._id,
          newStage: stage,
          deal
        });
      }

      res.json({
        success: true,
        data: deal
      });
    } catch (error) {
      logger.error('Error in updateDealStage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update deal stage'
      });
    }
  }

  async logDealAction(req, res) {
    try {
      const { action } = req.body;
      
      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'Action is required'
        });
      }

      const deal = await DealService.logDealAction(
        req.params.id,
        action,
        req.user._id
      );

      res.json({
        success: true,
        data: deal
      });
    } catch (error) {
      logger.error('Error in logDealAction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to log action'
      });
    }
  }

  async getDealStats(req, res) {
    try {
      const stats = await DealService.getDealershipStats(req.dealershipId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getDealStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats'
      });
    }
  }

  async deleteDeal(req, res) {
    try {
      const deal = await DealService.updateDeal(req.params.id, {
        isActive: false,
        deletedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Deal deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteDeal:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete deal'
      });
    }
  }

  async searchDeals(req, res) {
    try {
      const { q, stage, urgency, salesRep, from, to } = req.query;
      
      const searchCriteria = {};
      
      if (q) {
        searchCriteria.$or = [
          { 'customer.firstName': new RegExp(q, 'i') },
          { 'customer.lastName': new RegExp(q, 'i') },
          { 'vehicle.make': new RegExp(q, 'i') },
          { 'vehicle.model': new RegExp(q, 'i') }
        ];
      }
      
      if (stage) searchCriteria.stage = stage;
      if (urgency) searchCriteria.urgency = urgency;
      if (salesRep) searchCriteria.salesRep = salesRep;
      
      if (from || to) {
        searchCriteria.createdAt = {};
        if (from) searchCriteria.createdAt.$gte = new Date(from);
        if (to) searchCriteria.createdAt.$lte = new Date(to);
      }

      const deals = await DealService.searchDeals(req.dealershipId, searchCriteria);
      
      res.json({
        success: true,
        count: deals.length,
        data: deals
      });
    } catch (error) {
      logger.error('Error in searchDeals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search deals'
      });
    }
  }
}

module.exports = new DealController();