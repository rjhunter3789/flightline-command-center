class BaseConnector {
  constructor(config = {}) {
    this.config = config;
    this.provider = config.provider || 'unknown';
    this.capabilities = config.capabilities || [];
    this.readOnly = true;
  }

  getMetadata() {
    return {
      provider: this.provider,
      displayName: this.config.displayName || this.provider,
      status: this.config.status || 'stub',
      readOnly: true,
      capabilities: this.capabilities,
      notes: this.config.notes || []
    };
  }

  async healthCheck() {
    return {
      provider: this.provider,
      status: 'stub',
      readOnly: true,
      message: 'Connector is registered but no live provider credentials are configured.'
    };
  }

  async fetchDeals() {
    return [];
  }

  async fetchCustomers() {
    return [];
  }

  async fetchInventory() {
    return [];
  }

  async fetchActivities() {
    return [];
  }
}

module.exports = BaseConnector;
