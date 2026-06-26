const express = require('express');
const logger = require('../utils/logger');
const integrationService = require('../integrations/integrationService');

const router = express.Router();

const resolveProvider = (req) => req.params.provider || req.query.provider || 'mock';

router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'available',
    readOnly: true,
    message: 'FlightLine integration layer is available. All Phase 7 endpoints are read-only.'
  });
});

router.get('/providers', (req, res) => {
  res.json({
    success: true,
    readOnly: true,
    providers: integrationService.listIntegrationProviders()
  });
});

router.get('/:provider/health', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const health = await integrationService.getIntegrationHealth(provider);
    res.json({ success: true, readOnly: true, health });
  } catch (error) {
    logger.error('Integration health error:', error);
    res.status(500).json({ success: false, readOnly: true, error: 'Integration health check failed.' });
  }
});

router.get('/:provider/deals', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const deals = await integrationService.fetchNormalizedDeals(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: deals.length, deals });
  } catch (error) {
    logger.error('Integration deals error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/customers', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const customers = await integrationService.fetchNormalizedCustomers(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: customers.length, customers });
  } catch (error) {
    logger.error('Integration customers error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/inventory', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const inventory = await integrationService.fetchNormalizedInventory(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: inventory.length, inventory });
  } catch (error) {
    logger.error('Integration inventory error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/activities', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const activities = await integrationService.fetchNormalizedActivities(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: activities.length, activities });
  } catch (error) {
    logger.error('Integration activities error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

module.exports = router;
