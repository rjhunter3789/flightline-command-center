const MockConnector = require('./connectors/MockConnector');
const StubConnector = require('./connectors/StubConnector');

const providerConfigs = {
  mock: {
    provider: 'mock',
    displayName: 'Mock Demo Connector',
    connectorClass: MockConnector,
    status: 'active',
    category: 'demo'
  },
  reynolds: {
    provider: 'reynolds',
    displayName: 'Reynolds & Reynolds',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  vinsolutions: {
    provider: 'vinsolutions',
    displayName: 'VinSolutions',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'crm'
  },
  drivecentric: {
    provider: 'drivecentric',
    displayName: 'DriveCentric',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'crm'
  },
  tekion: {
    provider: 'tekion',
    displayName: 'Tekion',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  cdk: {
    provider: 'cdk',
    displayName: 'CDK',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  generic_api: {
    provider: 'generic_api',
    displayName: 'Generic API Connector',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'generic'
  }
};

const listProviders = () => Object.values(providerConfigs).map((config) => {
  const ConnectorClass = config.connectorClass;
  const connector = new ConnectorClass(config);
  return {
    ...connector.getMetadata(),
    category: config.category
  };
});

const getConnector = (provider = 'mock') => {
  const key = String(provider || 'mock').toLowerCase();
  const config = providerConfigs[key];
  if (!config) return null;
  const ConnectorClass = config.connectorClass;
  return new ConnectorClass(config);
};

module.exports = {
  listProviders,
  getConnector,
  providerConfigs
};
