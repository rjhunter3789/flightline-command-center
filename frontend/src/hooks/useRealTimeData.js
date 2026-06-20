import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

// Simulated data for development
const generateMockDeals = () => {
  const stages = ['showroom', 'test_drive', 'negotiation', 'finance'];
  const urgencies = ['normal', 'medium', 'high', 'critical'];
  const names = [
    'John Smith', 'Sarah Johnson', 'Mike Williams', 'Emily Davis',
    'Robert Brown', 'Lisa Anderson', 'David Miller', 'Jennifer Wilson',
    'James Taylor', 'Maria Garcia', 'William Martinez', 'Ashley Thompson'
  ];
  const vehicleOptions = [
      { make: 'Toyota', model: 'Camry' },
      { make: 'Honda', model: 'Accord' },
      { make: 'Ford', model: 'F-150' },
      { make: 'Chevrolet', model: 'Silverado' },
      { make: 'Nissan', model: 'Altima' },
      { make: 'Mazda', model: 'CX-5' },
      { make: 'Ford', model: 'Explorer' },
      { make: 'Lincoln', model: 'Navigator' },
      { make: 'Toyota', model: 'Highlander' },
      { make: 'Honda', model: 'CR-V' }
    ];
  const reps = ['Tom Johnson', 'Sarah Smith', 'Mike Davis', 'Emily Brown'];
  
  return Array.from({ length: 12 }, (_, i) => {
    const vehicle = vehicleOptions[Math.floor(Math.random() * vehicleOptions.length)];
    return {
    id: `DEAL-${1000 + i}`,
    customerName: names[i],
    stage: stages[Math.floor(Math.random() * stages.length)],
    urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
    timeInStage: `${Math.floor(Math.random() * 120)}m`,
    vehicleYear: 2024,
    vehicleMake: vehicle.make,
    vehicleModel: vehicle.model,
    grossProfit: Math.floor(Math.random() * 5000) + 2000,
    monthlyPayment: Math.floor(Math.random() * 300) + 400,
    salesRep: reps[Math.floor(Math.random() * reps.length)],
    probability: Math.floor(Math.random() * 30) + 70,
    nextAction: ['Follow up call', 'Check financing', 'Get manager approval'][Math.floor(Math.random() * 3)],
    alerts: Math.random() > 0.7 ? [{
      type: ['warning', 'critical'][Math.floor(Math.random() * 2)],
      message: ['Test drive overdue', 'Finance hold >2hrs', 'Customer waiting'][Math.floor(Math.random() * 3)]
    }] : []
    };
  });
};
const generateMockAlerts = () => {
  const alertTypes = ['critical', 'warning', 'info'];
  const messages = [
    'Test drive overdue: John Smith - 2024 Toyota Camry',
    'Finance approval pending >2hrs: Sarah Johnson',
    'Customer waiting in showroom >30min',
    'Hot lead requires immediate attention',
    'Inventory mismatch detected',
    'Staff member clocked out with active deal'
  ];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `ALERT-${Date.now()}-${i}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(Date.now() - Math.random() * 3600000),
    dealId: Math.random() > 0.5 ? `DEAL-${1000 + Math.floor(Math.random() * 12)}` : null,
    action: ['call_customer', 'check_status', 'call_bank'][Math.floor(Math.random() * 3)]
  }));
};

const generateMockStats = () => ({
  activeDeals: 12,
  grossPotential: 42500,
  avgDealTime: '2h 15m',
  staffOnline: 8,
  closeRate: 68,
  responseScore: 85,
  avgResponseTime: '8m'
});

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
        // In production, this would be an API call
        // For now, use mock data
        const mockDeals = generateMockDeals();
        const mockAlerts = generateMockAlerts();
        const mockStats = generateMockStats();
        
        setDeals(mockDeals);
        setAlerts(mockAlerts);
        setStats(mockStats);
        setLoading(false);
        
        // Simulate real-time updates
        const interval = setInterval(() => {
          // Update a random deal
          const randomDealIndex = Math.floor(Math.random() * mockDeals.length);
          const updatedDeal = {
            ...mockDeals[randomDealIndex],
            timeInStage: `${Math.floor(Math.random() * 120)}m`,
            probability: Math.floor(Math.random() * 30) + 70
          };
          
          setDeals(prev => prev.map((deal, index) => 
            index === randomDealIndex ? updatedDeal : deal
          ));
          
          // Occasionally add a new alert
          if (Math.random() > 0.7) {
            const newAlert = {
              id: `ALERT-${Date.now()}`,
              type: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
              message: `New activity detected: Deal #${1000 + randomDealIndex}`,
              timestamp: new Date(),
              dealId: `DEAL-${1000 + randomDealIndex}`,
              action: 'check_status'
            };
            
            setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
          }
          
          // Update stats
          setStats(prev => ({
            ...prev,
            activeDeals: mockDeals.length,
            avgResponseTime: `${Math.floor(Math.random() * 15) + 5}m`
          }));
        }, 5000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
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
