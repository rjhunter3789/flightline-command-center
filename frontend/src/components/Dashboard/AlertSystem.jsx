import React, { useState, useEffect } from 'react';
import './AlertSystem.css';

const AlertSystem = ({ alerts }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [minimized, setMinimized] = useState(false);
  
  useEffect(() => {
    // Keep only the most recent 5 alerts
    setVisibleAlerts(alerts.slice(0, 5));
  }, [alerts]);
  
  const dismissAlert = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };
  
  const getAlertClass = (type) => {
    return `alert-item alert-${type}`;
  };
  
  if (visibleAlerts.length === 0) {
    return null;
  }
  
  return (
    <div className={`alert-system ${minimized ? 'minimized' : ''}`}>
      <div className="alert-header">
        <h3>
          <span className="alert-header-icon">📡</span>
          System Alerts ({visibleAlerts.length})
        </h3>
        <button 
          className="minimize-btn"
          onClick={() => setMinimized(!minimized)}
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>
      
      {!minimized && (
        <div className="alert-list">
          {visibleAlerts.map(alert => (
            <div key={alert.id} className={getAlertClass(alert.type)}>
              <div className="alert-content">
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <div className="alert-details">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    <span className="alert-time">{formatTime(alert.timestamp)}</span>
                    {alert.dealId && (
                      <span className="alert-deal">Deal #{alert.dealId}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="alert-actions">
                {alert.action && (
                  <button 
                    className="alert-action-btn"
                    onClick={() => handleAlertAction(alert)}
                  >
                    {getActionLabel(alert.action)}
                  </button>
                )}
                <button 
                  className="alert-dismiss"
                  onClick={() => dismissAlert(alert.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!minimized && visibleAlerts.some(a => a.type === 'critical') && (
        <div className="alert-footer">
          <div className="critical-notice">
            ⚡ Critical alerts require immediate attention
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
};

const getActionLabel = (action) => {
  const labels = {
    call_customer: '📞 Call Customer',
    check_status: '🔍 Check Status',
    call_bank: '🏦 Call Bank',
    assign_manager: '👔 Get Manager',
    view_deal: '📋 View Deal'
  };
  return labels[action] || 'Take Action';
};

const handleAlertAction = (alert) => {
  console.log(`Handling action ${alert.action} for alert ${alert.id}`);
  // In real implementation, trigger appropriate action
};

export default AlertSystem;