import React, { useState, useEffect } from 'react';
  import './IncentiveDisplay.css';

  const IncentiveDisplay = ({ vehicle }) => {
    const [incentives, setIncentives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (vehicle?.vehicleMake && vehicle?.vehicleModel && vehicle?.vehicleYear) {
        fetchIncentives();
      }
    }, [vehicle]);

    const fetchIncentives = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/incentives/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle: {
              make: vehicle.vehicleMake,
              model: vehicle.vehicleModel,
              year: vehicle.vehicleYear
            }
          })
        });

        const data = await response.json();
        if (data.success) {
          setIncentives(data.data.eligible || []);
        }
      } catch (error) {
        console.error('Failed to fetch incentives:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!incentives.length) return null;

    const totalSavings = incentives
      .filter(inc => inc.type === 'cash_rebate' && inc.stackable)
      .reduce((sum, inc) => sum + inc.cashAmount, 0);

    return (
      <div className="incentive-display">
        <div className="incentive-header" onClick={() => setExpanded(!expanded)}>
          <span className="incentive-tag">💰 {incentives.length} Incentives</span>
          {totalSavings > 0 && (
            <span className="incentive-savings">${totalSavings.toLocaleString()} available</span>
          )}
        </div>

        {expanded && (
          <div className="incentive-list">
            {incentives.map(inc => (
              <div key={inc._id} className="incentive-item">
                <span className="incentive-name">{inc.name}</span>
                {inc.cashAmount > 0 && (
                  <span className="incentive-amount">${inc.cashAmount.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  export default IncentiveDisplay;
