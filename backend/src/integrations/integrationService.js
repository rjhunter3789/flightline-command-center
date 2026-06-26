const { getConnector, listProviders } = require('./registry');
const {
  normalizeDeal,
  normalizeCustomer,
  normalizeInventoryUnit,
  normalizeActivity
} = require('./normalizers/flightlineNormalizer');

const providerContext = (provider, query = {}) => ({
  provider,
  dealershipId: query.dealershipId || null,
  source: provider
});

const listIntegrationProviders = () => listProviders();

const getIntegrationHealth = async (provider) => {
  const connector = getConnector(provider);
  if (!connector) {
    return {
      provider,
      status: 'not_found',
      readOnly: true,
      message: 'Unknown integration provider.'
    };
  }
  return connector.healthCheck();
};

const fetchNormalizedDeals = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error('Unknown integration provider: ' + provider);
  const rawDeals = await connector.fetchDeals(query);
  return rawDeals.map((deal) => normalizeDeal(deal, providerContext(provider, query)));
};

const fetchNormalizedCustomers = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error('Unknown integration provider: ' + provider);
  const rawCustomers = await connector.fetchCustomers(query);
  return rawCustomers.map((customer) => normalizeCustomer(customer, providerContext(provider, query)));
};

const fetchNormalizedInventory = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error('Unknown integration provider: ' + provider);
  const rawInventory = await connector.fetchInventory(query);
  return rawInventory.map((unit) => normalizeInventoryUnit(unit, providerContext(provider, query)));
};

const fetchNormalizedActivities = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error('Unknown integration provider: ' + provider);
  const rawActivities = await connector.fetchActivities(query);
  return rawActivities.map((activity) => normalizeActivity(activity, providerContext(provider, query)));
};

module.exports = {
  listIntegrationProviders,
  getIntegrationHealth,
  fetchNormalizedDeals,
  fetchNormalizedCustomers,
  fetchNormalizedInventory,
  fetchNormalizedActivities
};
