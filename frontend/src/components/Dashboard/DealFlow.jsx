import React from 'react';
import './DealFlow.css';

const DealFlow = ({ deals, onStageSelect, selectedStage }) => {
  // Calculate deals per stage
  const stages = [
    { 
      id: 'showroom', 
      name: 'Showroom', 
      icon: '🏬',
      color: '#3B82F6',
      description: 'Browsing & Qualifying'
    },
    { 
      id: 'test_drive', 
      name: 'Test Drive', 
      icon: '🚗',
      color: '#10B981',
      description: 'Vehicle Out'
    },
    { 
      id: 'negotiation', 
      name: 'Negotiation', 
      icon: '💬',
      color: '#F59E0B',
      description: 'Working Numbers'
    },
    { 
      id: 'finance', 
      name: 'F&I Office', 
      icon: '💰',
      color: '#8B5CF6',
      description: 'Finalizing Deal'
    }
  ];
  
  const dealsByStage = stages.map(stage => ({
    ...stage,
    count: deals.filter(deal => deal.stage === stage.id).length,
    deals: deals.filter(deal => deal.stage === stage.id)
  }));
  
  const totalDeals = deals.length;
  
  return (
    <div className="deal-flow">
      <h2 className="section-title">Deal Flow Pipeline</h2>
      
      <div className="pipeline-visualization">
        {dealsByStage.map((stage, index) => (
          <div key={stage.id} className="pipeline-stage">
            <div 
              className={`stage-card ${selectedStage === stage.id ? 'selected' : ''}`}
              onClick={() => onStageSelect(stage.id)}
              style={{ borderColor: stage.color }}
            >
              <div className="stage-header">
                <span className="stage-icon" style={{ backgroundColor: stage.color }}>
                  {stage.icon}
                </span>
                <div className="stage-info">
                  <h3>{stage.name}</h3>
                  <p>{stage.description}</p>
                </div>
              </div>
              
              <div className="stage-metrics">
                <div className="deal-count">
                  <span className="count-number">{stage.count}</span>
                  <span className="count-label">deals</span>
                </div>
                <div className="stage-percentage">
                  {totalDeals > 0 
                    ? `${Math.round((stage.count / totalDeals) * 100)}%` 
                    : '0%'
                  }
                </div>
              </div>
              
              {stage.deals.length > 0 && (
                <div className="stage-preview">
                  {stage.deals.slice(0, 3).map(deal => (
                    <div key={deal.id} className="preview-deal">
                      <span className="customer-name">{deal.customerName}</span>
                      <span className="deal-time">{deal.timeInStage}</span>
                    </div>
                  ))}
                  {stage.deals.length > 3 && (
                    <div className="more-deals">+{stage.deals.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
            
            {index < dealsByStage.length - 1 && (
              <div className="pipeline-arrow">→</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flow-controls">
        <button 
          className={`flow-filter ${selectedStage === 'all' ? 'active' : ''}`}
          onClick={() => onStageSelect('all')}
        >
          All Stages ({totalDeals})
        </button>
      </div>
      
      <div className="flow-insights">
        <div className="insight">
          <span className="insight-icon">📊</span>
          <span className="insight-text">
            Average flow time: {calculateAvgFlowTime(deals)}
          </span>
        </div>
        <div className="insight">
          <span className="insight-icon">🎯</span>
          <span className="insight-text">
            Conversion rate: {calculateConversionRate(deals)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const calculateAvgFlowTime = (deals) => {
  if (deals.length === 0) return '0m';
  // In real implementation, calculate actual average time
  return '2h 15m';
};

const calculateConversionRate = (deals) => {
  if (deals.length === 0) return 0;
  // In real implementation, calculate actual conversion rate
  return 68;
};

export default DealFlow;