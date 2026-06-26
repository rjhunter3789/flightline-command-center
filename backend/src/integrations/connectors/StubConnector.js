const BaseConnector = require('./BaseConnector');

class StubConnector extends BaseConnector {
  constructor(config = {}) {
    super({
      status: 'stub',
      capabilities: config.capabilities || ['deals', 'customers', 'inventory', 'activities'],
      notes: [
        'Provider-specific connector placeholder.',
        'No live credentials or API contract configured yet.',
        'Read-only integration only.'
      ],
      ...config
    });
  }
}

module.exports = StubConnector;
