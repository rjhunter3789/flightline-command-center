const Deal = require('../models/Deal');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');
const { broadcastDealUpdate, broadcastStatsUpdate } = require('./socketHandler');

class DealService {
  async getActiveDealsByDealership(dealershipId) {
    try {
      const deals = await Deal.find({
        dealership: dealershipId,
        isActive: true,
        stage: { $ne: 'completed' }
      })
        .populate('customer')
        .populate('salesRep', 'firstName lastName')
        .sort('-createdAt');

      return deals;
    } catch (error) {
      logger.error('Error fetching active deals:', error);
      throw error;
    }
  }

  async getDealById(dealId) {
    try {
      const deal = await Deal.findById(dealId)
        .populate('customer')
        .populate('salesRep', 'firstName lastName')
        .populate('dealership');

      return deal;
    } catch (error) {
      logger.error('Error fetching deal:', error);
      throw error;
    }
  }

  async createDeal(dealData) {
    try {
      // Create or find customer
      let customer = await Customer.findOne({
        email: dealData.customer.email,
        dealership: dealData.dealershipId
      });

      if (!customer) {
        customer = await Customer.create({
          ...dealData.customer,
          dealership: dealData.dealershipId
        });
      }

      // Create deal
      const deal = await Deal.create({
        ...dealData,
        customer: customer._id,
        dealership: dealData.dealershipId,
        stageHistory: [{
          stage: dealData.stage || 'showroom',
          timestamp: new Date(),
          duration: 0
        }]
      });

      // Populate references
      await deal.populate('customer');
      await deal.populate('salesRep', 'firstName lastName');

      logger.info(`Deal created: ${deal._id}`);
      return deal;
    } catch (error) {
      logger.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(dealId, updates) {
    try {
      const deal = await Deal.findByIdAndUpdate(
        dealId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('customer')
        .populate('salesRep', 'firstName lastName');

      if (!deal) {
        throw new Error('Deal not found');
      }

      logger.info(`Deal updated: ${dealId}`);
      return deal;
    } catch (error) {
      logger.error('Error updating deal:', error);
      throw error;
    }
  }

  async changeDealStage(dealId, newStage) {
    try {
      const deal = await Deal.findById(dealId);
      
      if (!deal) {
        throw new Error('Deal not found');
      }

      const oldStage = deal.stage;
      
      // Update stage history
      const lastStageEntry = deal.stageHistory[deal.stageHistory.length - 1];
      lastStageEntry.duration = Date.now() - new Date(lastStageEntry.timestamp).getTime();
      
      deal.stageHistory.push({
        stage: newStage,
        timestamp: new Date(),
        duration: 0
      });

      deal.stage = newStage;
      deal.updatedAt = new Date();

      await deal.save();
      await deal.populate('customer');
      await deal.populate('salesRep', 'firstName lastName');

      logger.info(`Deal ${dealId} stage changed from ${oldStage} to ${newStage}`);
      return deal;
    } catch (error) {
      logger.error('Error changing deal stage:', error);
      throw error;
    }
  }

  async logDealAction(dealId, action, userId) {
    try {
      const deal = await Deal.findById(dealId);
      
      if (!deal) {
        throw new Error('Deal not found');
      }

      deal.actionHistory.push({
        action,
        timestamp: new Date(),
        performedBy: userId
      });

      await deal.save();

      logger.info(`Action ${action} logged for deal ${dealId}`);
      return deal;
    } catch (error) {
      logger.error('Error logging deal action:', error);
      throw error;
    }
  }

  async getDealershipStats(dealershipId) {
    try {
      const deals = await Deal.find({
        dealership: dealershipId,
        isActive: true
      });

      const stats = {
        totalActiveDeals: deals.filter(d => d.stage !== 'completed').length,
        dealsInShowroom: deals.filter(d => d.stage === 'showroom').length,
        dealsOnTestDrive: deals.filter(d => d.stage === 'test_drive').length,
        dealsInNegotiation: deals.filter(d => d.stage === 'negotiation').length,
        dealsInFinance: deals.filter(d => d.stage === 'finance').length,
        completedToday: deals.filter(d => 
          d.stage === 'completed' && 
          new Date(d.updatedAt).toDateString() === new Date().toDateString()
        ).length,
        grossPotential: deals
          .filter(d => d.stage !== 'completed')
          .reduce((sum, deal) => sum + (deal.vehicle?.price || 0), 0),
        averageTimeInStage: this.calculateAverageStageTime(deals),
        conversionRate: this.calculateConversionRate(deals)
      };

      return stats;
    } catch (error) {
      logger.error('Error calculating dealership stats:', error);
      throw error;
    }
  }

  calculateAverageStageTime(deals) {
    const stageTimes = {};
    const stages = ['showroom', 'test_drive', 'negotiation', 'finance'];
    
    stages.forEach(stage => {
      const stageEntries = deals
        .flatMap(d => d.stageHistory)
        .filter(h => h.stage === stage && h.duration > 0);
      
      if (stageEntries.length > 0) {
        const avgTime = stageEntries.reduce((sum, entry) => sum + entry.duration, 0) / stageEntries.length;
        stageTimes[stage] = Math.round(avgTime / 60000); // Convert to minutes
      } else {
        stageTimes[stage] = 0;
      }
    });

    return stageTimes;
  }

  calculateConversionRate(deals) {
    const totalDeals = deals.length;
    const completedDeals = deals.filter(d => d.stage === 'completed').length;
    
    return totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;
  }

  async searchDeals(dealershipId, searchCriteria) {
    try {
      const query = {
        dealership: dealershipId,
        ...searchCriteria
      };

      const deals = await Deal.find(query)
        .populate('customer')
        .populate('salesRep', 'firstName lastName')
        .sort('-createdAt');

      return deals;
    } catch (error) {
      logger.error('Error searching deals:', error);
      throw error;
    }
  }
}

module.exports = new DealService();