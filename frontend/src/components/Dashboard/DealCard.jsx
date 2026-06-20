import React, { useState } from 'react';
import './DealCard.css';
import IncentiveDisplay from './IncentiveDisplay';
import TradeInDisplay from './TradeInDisplay';
import DealDetails from './DealDetails';

const DealCard = ({ deal }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const getStatusColor = (stage) => {
    const colors = {
      showroom: '#3B82F6',
      test_drive: '#10B981',
      negotiation: '#F59E0B',
      finance: '#8B5CF6'
    };
    return colors[stage] || '#6B7280';
  };
  
  const getUrgencyClass = (urgency) => {
    if (urgency === 'critical') return 'urgency-critical';
    if (urgency === 'high') return 'urgency-high';
    if (urgency === 'medium') return 'urgency-medium';
    return 'urgency-normal';
  };
  
  const handleAction = (action, e) => {
    e.stopPropagation();
    console.log(`Action ${action} for deal ${deal.id}`);
    // In real implementation, trigger actual actions
  };
  
  return (
    <div 
      className={`deal-card ${getUrgencyClass(deal.urgency)}`}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="deal-header">
        <div className="deal-status" style={{ backgroundColor: getStatusColor(deal.stage) }}>
          <span className="status-icon">{getStageIcon(deal.stage)}</span>
          <span className="status-text">{deal.stage.replace('_', ' ')}</span>
        </div>
        <div className="deal-time">
          <span className="time-icon">⏱️</span>
          <span className="time-text">{deal.timeInStage}</span>
        </div>
      </div>
      
      <div className="deal-content">
        <h3 className="customer-name">{deal.customerName}</h3>
        <div className="vehicle-info">
          {deal.vehicleYear} {deal.vehicleMake} {deal.vehicleModel}
        </div>

        <IncentiveDisplay vehicle={deal} />

        <TradeInDisplay
            dealId={deal._id}
            dealStatus={deal.stage}
            onTradeUpdate={(tradeIn) => {
              console.log('Trade-in updated:', tradeIn);
            }}
          />
        
        <div className="deal-metrics">
          <div className="metric">
            <span className="metric-label">Gross:</span>
            <span className="metric-value">${deal.grossProfit.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Payment:</span>
            <span className="metric-value">${deal.monthlyPayment}/mo</span>
          </div>
        </div>
        
        <div className="deal-rep">
          <span className="rep-icon">👤</span>
          <span className="rep-name">{deal.salesRep}</span>
        </div>
        
        {deal.alerts && deal.alerts.length > 0 && (
          <div className="deal-alerts">
            {deal.alerts.map((alert, index) => (
              <div key={index} className={`alert-badge ${alert.type}`}>
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showActions && (
        <div className="deal-actions">
          <button 
            className="action-btn primary"
            onClick={(e) => handleAction('call', e)}
          >
            📞 Call
          </button>
          <button 
            className="action-btn secondary"
            onClick={(e) => handleAction('text', e)}
          >
            💬 Text
          </button>
          <button 
            className="action-btn info"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            📋 Details
          </button>
          {deal.urgency === 'critical' && (
            <button 
              className="action-btn danger"
              onClick={(e) => handleAction('escalate', e)}
            >
              🚨 Escalate
            </button>
          )}
        </div>
      )}
      
      <div className="deal-footer">
        <div className="next-action">
          <span className="action-icon">➡️</span>
          <span className="action-text">{deal.nextAction || 'Follow up'}</span>
        </div>
        {deal.probability && (
          <div className="close-probability">
            <span className="probability-value">{deal.probability}%</span>
            <span className="probability-label">close</span>
          </div>
        )}
      </div>
      {showDetails && (
          <DealDetails
            dealId={deal._id || deal.id}
            deal={deal}
            onClose={() => setShowDetails(false)}
          />
        )}
    </div>
  );
};

// Helper function
const getStageIcon = (stage) => {
  const icons = {
    showroom: '🏬',
    test_drive: '🚗',
    negotiation: '💬',
    finance: '💰'
  };
  return icons[stage] || '📋';
};

export default DealCard;
