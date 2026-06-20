// FLIGHTLINE - PROJECT STRUCTURE
// =====================================

/*
PROJECT DIRECTORY STRUCTURE:
=====================================

flightline/
├── frontend/                    # React/Next.js Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Dashboard/      # Main dashboard components
│   │   │   │   ├── MissionStatus.jsx
│   │   │   │   ├── DealFlow.jsx
│   │   │   │   ├── DealCard.jsx
│   │   │   │   └── AlertSystem.jsx
│   │   │   ├── Layout/         # Navigation and layout
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── Common/         # Shared components
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/              # Next.js pages or React Router
│   │   │   ├── dashboard.jsx   # Main command center
│   │   │   ├── deals/          # Deal management pages
│   │   │   │   ├── [id].jsx    # Individual deal details
│   │   │   │   └── index.jsx   # Deals overview
│   │   │   ├── analytics.jsx   # Performance analytics
│   │   │   └── settings.jsx    # User/dealership settings
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useRealTimeData.js
│   │   │   ├── useWebSocket.js
│   │   │   └── useAPIClient.js
│   │   ├── services/           # API and external services
│   │   │   ├── api/
│   │   │   │   ├── deals.js
│   │   │   │   ├── customers.js
│   │   │   │   └── integrations.js
│   │   │   ├── websocket.js
│   │   │   └── auth.js
│   │   ├── utils/              # Helper functions
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   └── styles/             # CSS and styling
│   │       ├── globals.css
│   │       ├── components.css
│   │       └── dashboard.css
│   ├── public/                 # Static assets
│   │   ├── icons/
│   │   ├── images/
│   │   └── manifest.json
│   ├── package.json
│   └── next.config.js
│
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── dealController.js
│   │   │   ├── integrationController.js
│   │   │   └── authController.js
│   │   ├── services/           # Business logic
│   │   │   ├── dealService.js
│   │   │   ├── integrationService.js
│   │   │   ├── websocketService.js
│   │   │   └── alertService.js
│   │   ├── integrations/       # CRM/DMS connectors
│   │   │   ├── vinsolutions.js
│   │   │   ├── dealersocket.js
│   │   │   ├── cdk.js
│   │   │   └── base.js
│   │   ├── models/             # Data models
│   │   │   ├── Deal.js
│   │   │   ├── Customer.js
│   │   │   ├── User.js
│   │   │   └── Dealership.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── rateLimiting.js
│   │   ├── routes/             # API routes
│   │   │   ├── deals.js
│   │   │   ├── integrations.js
│   │   │   └── auth.js
│   │   ├── utils/              # Helper functions
│   │   │   ├── logger.js
│   │   │   ├── cache.js
│   │   │   └── encryption.js
│   │   └── config/             # Configuration
│   │       ├── database.js
│   │       ├── integrations.js
│   │       └── app.js
│   ├── tests/                  # Test files
│   │   ├── integration/
│   │   ├── unit/
│   │   └── mocks/
│   ├── package.json
│   └── server.js
│
├── shared/                     # Shared utilities/types
│   ├── types/                  # TypeScript definitions
│   │   ├── Deal.ts
│   │   ├── Customer.ts
│   │   └── API.ts
│   ├── constants/              # Shared constants
│   │   ├── dealStages.js
│   │   ├── alertTypes.js
│   │   └── integrations.js
│   └── utils/                  # Shared utility functions
│       ├── dateUtils.js
│       └── validationUtils.js
│
├── infrastructure/             # DevOps and deployment
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── frontend-deployment.yaml
│   │   ├── backend-deployment.yaml
│   │   └── ingress.yaml
│   ├── terraform/              # Infrastructure as code
│   └── scripts/                # Deployment scripts
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── integrations/           # Integration guides
│   ├── deployment/             # Deployment guides
│   └── user-guide/             # User documentation
│
├── .github/                    # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── README.md
├── .gitignore
├── .env.example
└── package.json
*/

// =====================================
// CORE COMPONENT STRUCTURE
// =====================================

// 1. MAIN DASHBOARD COMPONENT
// frontend/src/components/Dashboard/Dashboard.jsx
/*
import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import MissionStatus from './MissionStatus';
import DealFlow from './DealFlow';
import DealCard from './DealCard';
import AlertSystem from './AlertSystem';

const Dashboard = () => {
  const { deals, alerts, stats, loading } = useRealTimeData();
  
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <MissionStatus stats={stats} alerts={alerts} />
        <DealFlow deals={deals} />
        <div className="deal-cards">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
      <AlertSystem alerts={alerts} />
    </div>
  );
};

export default Dashboard;
*/

// 2. REAL-TIME DATA HOOK
// frontend/src/hooks/useRealTimeData.js
/*
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { apiClient } from '../services/api';

export const useRealTimeData = () => {
  const [deals, setDeals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { socket, isConnected } = useWebSocket();
  
  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [dealsData, statsData] = await Promise.all([
          apiClient.deals.getAll(),
          apiClient.stats.getDashboard()
        ]);
        
        setDeals(dealsData);
        setStats(statsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (socket) {
      socket.on('deal_updated', (updatedDeal) => {
        setDeals(prev => prev.map(deal => 
          deal.id === updatedDeal.id ? updatedDeal : deal
        ));
      });
      
      socket.on('new_alert', (alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 4)]);
      });
      
      socket.on('stats_updated', (newStats) => {
        setStats(newStats);
      });
    }
    
    return () => {
      socket?.off('deal_updated');
      socket?.off('new_alert');
      socket?.off('stats_updated');
    };
  }, [socket]);
  
  return { deals, alerts, stats, loading, isConnected };
};
*/

// 3. API CLIENT STRUCTURE
// frontend/src/services/api/index.js
/*
class APIClient {
  constructor(baseURL = process.env.REACT_APP_API_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('flightline_token');
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  deals = {
    getAll: () => this.request('/api/deals'),
    getById: (id) => this.request(`/api/deals/${id}`),
    update: (id, data) => this.request(`/api/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  };
  
  stats = {
    getDashboard: () => this.request('/api/stats/dashboard'),
  };
  
  integrations = {
    sync: (provider) => this.request('/api/integrations/sync', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),
  };
}

export const apiClient = new APIClient();
*/

// 4. BACKEND DEAL SERVICE
// backend/src/services/dealService.js
/*
const Deal = require('../models/Deal');
const integrationService = require('./integrationService');
const websocketService = require('./websocketService');

class DealService {
  async getAllDeals(dealershipId) {
    return await Deal.find({ dealershipId, status: { $ne: 'closed' } })
      .populate('customer')
      .sort({ updatedAt: -1 });
  }
  
  async updateDealStatus(dealId, newStatus, userId) {
    const deal = await Deal.findByIdAndUpdate(
      dealId,
      { 
        status: newStatus,
        lastUpdatedBy: userId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('customer');
    
    // Emit real-time update
    websocketService.broadcast('deal_updated', deal);
    
    // Check for alerts
    this.checkDealAlerts(deal);
    
    return deal;
  }
  
  checkDealAlerts(deal) {
    const alerts = [];
    
    // Test drive overdue check
    if (deal.status === 'test_drive' && 
        this.getMinutesSince(deal.statusChangedAt) > 45) {
      alerts.push({
        type: 'urgent',
        message: `Test drive overdue: ${deal.customer.name}`,
        dealId: deal._id,
        action: 'call_customer'
      });
    }
    
    // Finance hold check
    if (deal.status === 'finance_hold' && 
        this.getMinutesSince(deal.statusChangedAt) > 120) {
      alerts.push({
        type: 'warning',
        message: `Finance hold >2hrs: ${deal.customer.name}`,
        dealId: deal._id,
        action: 'call_bank'
      });
    }
    
    alerts.forEach(alert => {
      websocketService.broadcast('new_alert', alert);
    });
  }
  
  getMinutesSince(timestamp) {
    return Math.floor((Date.now() - new Date(timestamp)) / 60000);
  }
  
  async syncFromCRM(crmProvider, dealershipId) {
    return await integrationService.syncDeals(crmProvider, dealershipId);
  }
}

module.exports = new DealService();
*/

// 5. INTEGRATION BASE CLASS
// backend/src/integrations/base.js
/*
class BaseIntegration {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }
  
  async authenticate() {
    throw new Error('authenticate() must be implemented');
  }
  
  async fetchDeals() {
    throw new Error('fetchDeals() must be implemented');
  }
  
  async fetchCustomers() {
    throw new Error('fetchCustomers() must be implemented');
  }
  
  transformDeal(rawDeal) {
    // Base transformation logic
    return {
      id: rawDeal.id,
      customerId: rawDeal.customer_id,
      vehicleInfo: rawDeal.vehicle,
      status: this.mapStatus(rawDeal.status),
      gross: rawDeal.gross_profit,
      payment: rawDeal.monthly_payment,
      createdAt: new Date(rawDeal.created_at),
      updatedAt: new Date(rawDeal.updated_at),
    };
  }
  
  mapStatus(rawStatus) {
    // Override in child classes
    return rawStatus;
  }
}

module.exports = BaseIntegration;
*/

// =====================================
// PACKAGE.JSON EXAMPLES
// =====================================

// Frontend package.json
/*
{
  "name": "flightline-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@next/font": "^13.0.0",
    "next": "^13.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "socket.io-client": "^4.7.0",
    "framer-motion": "^10.0.0",
    "date-fns": "^2.29.0",
    "recharts": "^2.5.0",
    "lucide-react": "^0.263.1"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  }
}
*/

// Backend package.json
/*
{
  "name": "flightline-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "rate-limiter-flexible": "^2.4.1",
    "winston": "^3.8.0",
    "joi": "^17.9.0",
    "node-cron": "^3.0.2",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
*/

// =====================================
// ENVIRONMENT VARIABLES
// =====================================

// .env.example
/*
# Database
DATABASE_URL=mongodb://localhost:27017/flightline
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Integrations
VINSOLUTIONS_API_KEY=your-vinsolutions-key
VINSOLUTIONS_API_URL=https://api.vinsolutions.com/v1
DEALERSOCKET_API_KEY=your-dealersocket-key
CDK_API_KEY=your-cdk-key

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
*/