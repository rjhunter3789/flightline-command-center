import React from 'react';
import './MissionStatus.css';

const MissionStatus = ({ stats, alerts }) => {
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
  const warningAlerts = alerts.filter(a => a.type === 'warning').length;
  
  return (
    <div className="mission-status">
      <h2 className="section-title">Mission Status</h2>
      
      <div className="status-grid">
        <div className="status-card primary">
          <div className="status-icon">🎯</div>
          <div className="status-content">
            <div className="status-value">{stats.activeDeals || 0}</div>
            <div className="status-label">Active Deals</div>
          </div>
        </div>
        
        <div className="status-card success">
          <div className="status-icon">💰</div>
          <div className="status-content">
            <div className="status-value">${(stats.grossPotential || 0).toLocaleString()}</div>
            <div className="status-label">Gross Potential</div>
          </div>
        </div>
        
        <div className="status-card warning">
          <div className="status-icon">⏱️</div>
          <div className="status-content">
            <div className="status-value">{stats.avgDealTime || '0m'}</div>
            <div className="status-label">Avg Deal Time</div>
          </div>
        </div>
        
        <div className="status-card info">
          <div className="status-icon">👥</div>
          <div className="status-content">
            <div className="status-value">{stats.staffOnline || 0}</div>
            <div className="status-label">Staff Online</div>
          </div>
        </div>
      </div>
      
      <div className="alert-summary">
        <h3>System Alerts</h3>
        <div className="alert-counters">
          {criticalAlerts > 0 && (
            <div className="alert-counter critical">
              <span className="alert-icon">🚨</span>
              <span className="alert-count">{criticalAlerts} Critical</span>
            </div>
          )}
          {warningAlerts > 0 && (
            <div className="alert-counter warning">
              <span className="alert-icon">⚠️</span>
              <span className="alert-count">{warningAlerts} Warnings</span>
            </div>
          )}
          {criticalAlerts === 0 && warningAlerts === 0 && (
            <div className="alert-counter all-clear">
              <span className="alert-icon">✅</span>
              <span className="alert-count">All Systems Normal</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="performance-indicators">
        <h3>Performance</h3>
        <div className="indicator">
          <label>Close Rate</label>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${stats.closeRate || 0}%` }}
            ></div>
          </div>
          <span className="indicator-value">{stats.closeRate || 0}%</span>
        </div>
        <div className="indicator">
          <label>Response Time</label>
          <div className="progress-bar">
            <div 
              className="progress-fill success"
              style={{ width: `${Math.min(100, (stats.responseScore || 0))}%` }}
            ></div>
          </div>
          <span className="indicator-value">{stats.avgResponseTime || '0m'}</span>
        </div>
      </div>
    </div>
  );
};

export default MissionStatus;