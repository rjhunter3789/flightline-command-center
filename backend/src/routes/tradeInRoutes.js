const express = require('express');
  const router = express.Router();
  const TradeIn = require('../models/TradeIn');
  const Deal = require('../models/Deal');

  // Get trade-in for a specific deal
  router.get('/deal/:dealId', async (req, res) => {
    try {
      // Add validation here
      const { dealId } = req.params;

      // Check if dealId is a valid ObjectId
      if (!dealId || !dealId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid deal ID format' });
      }

      const tradeIn = await TradeIn.findOne({ dealId: req.params.dealId });
      res.json(tradeIn);
    } catch (error) {
      console.error('Error fetching trade-in:', error);
      res.status(500).json({ error: 'Failed to fetch trade-in' });
    }
  });

  // Create or update trade-in
  router.post('/deal/:dealId', async (req, res) => {
    try {
      const { dealId } = req.params;

      // Check if dealId is a valid ObjectId
      if (!dealId || !dealId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid deal ID format' });
      }

      // Verify deal exists
      const deal = await Deal.findById(dealId);
      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      // Check if trade-in already exists
      let tradeIn = await TradeIn.findOne({ dealId });

      if (tradeIn) {
        // Update existing trade-in
        tradeIn = await TradeIn.findByIdAndUpdate(
          tradeIn._id,
          {
            ...req.body,
            lastUpdatedBy: req.body.evaluatedBy || 'system',
            dealId // Ensure dealId doesn't change
          },
          { new: true, runValidators: true }
        );
      } else {
        // Create new trade-in
        tradeIn = await TradeIn.create({
          ...req.body,
          dealId
        });
      }

      // Update deal with trade-in reference and recalculate gross
      if (tradeIn) {
        // Calculate new gross profit including trade over-allowance
        const baseGross = deal.grossProfit || 0;
        const tradeImpact = -tradeIn.overAllowance; // Negative over-allowance reduces gross

        await Deal.findByIdAndUpdate(dealId, {
          hasTradeIn: true,
          tradeInId: tradeIn._id,
          tradeInAllowance: tradeIn.allowance,
          tradeInACV: tradeIn.acv,
          tradeInOverAllowance: tradeIn.overAllowance,
          // Adjust gross profit for trade impact
          adjustedGrossProfit: baseGross + tradeImpact
        });

        // Check if trade needs approval and create alert if needed
        if (tradeIn.needsApproval()) {
          // This would trigger an alert through the alert system
          // For now, we'll just add a flag to the response
          tradeIn._doc.requiresApproval = true;
        }
      }

      res.json(tradeIn);
    } catch (error) {
      console.error('Error saving trade-in:', error);
      res.status(500).json({ error: 'Failed to save trade-in' });
    }
  });

  // Update book values
  router.patch('/:tradeInId/book-values', async (req, res) => {
    try {
      const { source, values } = req.body;

      if (!['nada', 'kbb', 'blackbook', 'vauto'].includes(source)) {
        return res.status(400).json({ error: 'Invalid book source' });
      }

      const update = {
        [`bookValues.${source}`]: {
          ...values,
          dateChecked: new Date()
        }
      };

      const tradeIn = await TradeIn.findByIdAndUpdate(
        req.params.tradeInId,
        update,
        { new: true, runValidators: true }
      );

      if (!tradeIn) {
        return res.status(404).json({ error: 'Trade-in not found' });
      }

      res.json(tradeIn);
    } catch (error) {
      console.error('Error updating book values:', error);
      res.status(500).json({ error: 'Failed to update book values' });
    }
  });

  // Upload trade-in photos
  router.post('/:tradeInId/photos', async (req, res) => {
    try {
      const { url, caption } = req.body;

      const tradeIn = await TradeIn.findByIdAndUpdate(
        req.params.tradeInId,
        {
          $push: {
            photos: {
              url,
              caption,
              uploadedAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (!tradeIn) {
        return res.status(404).json({ error: 'Trade-in not found' });
      }

      res.json(tradeIn);
    } catch (error) {
      console.error('Error adding photo:', error);
      res.status(500).json({ error: 'Failed to add photo' });
    }
  });

  // Delete trade-in photo
  router.delete('/:tradeInId/photos/:photoIndex', async (req, res) => {
    try {
      const { tradeInId, photoIndex } = req.params;

      const tradeIn = await TradeIn.findById(tradeInId);
      if (!tradeIn) {
        return res.status(404).json({ error: 'Trade-in not found' });
      }

      tradeIn.photos.splice(photoIndex, 1);
      await tradeIn.save();

      res.json(tradeIn);
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });

  // Get all trade-ins with alerts
  router.get('/alerts', async (req, res) => {
    try {
      const tradeIns = await TradeIn.find({
        $or: [
          { 'flags.overAllowanceAlert': true },
          { 'flags.payoffAlert': true },
          { 'flags.conditionAlert': true },
          { 'flags.priceVarianceAlert': true }
        ]
      }).populate('dealId', 'customerName salesPerson status');

      res.json(tradeIns);
    } catch (error) {
      console.error('Error fetching trade-in alerts:', error);
      res.status(500).json({ error: 'Failed to fetch trade-in alerts' });
    }
  });

  // Calculate trade impact on gross profit
  router.get('/:tradeInId/impact', async (req, res) => {
    try {
      const tradeIn = await TradeIn.findById(req.params.tradeInId);
      if (!tradeIn) {
        return res.status(404).json({ error: 'Trade-in not found' });
      }

      const impact = {
        overAllowance: tradeIn.overAllowance,
        equity: tradeIn.equity,
        acv: tradeIn.acv,
        allowance: tradeIn.allowance,
        payoff: tradeIn.payoff,
        netTradeValue: tradeIn.allowance - tradeIn.payoff, // What we're actually giving customer
        grossImpact: -tradeIn.overAllowance, // Negative over-allowance reduces gross
        requiresApproval: tradeIn.needsApproval(),
        alerts: {
          overAllowance: tradeIn.flags.overAllowanceAlert,
          negativeEquity: tradeIn.flags.payoffAlert,
          poorCondition: tradeIn.flags.conditionAlert,
          priceVariance: tradeIn.flags.priceVarianceAlert
        }
      };

      res.json(impact);
    } catch (error) {
      console.error('Error calculating trade impact:', error);
      res.status(500).json({ error: 'Failed to calculate trade impact' });
    }
  });

  module.exports = router;
