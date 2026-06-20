import React, { useState, useEffect } from 'react';
  import { Car, DollarSign, AlertTriangle, Edit, Plus } from 'lucide-react';
  import TradeInForm from './TradeInForm';
  import './TradeInDisplay.css';

  const TradeInDisplay = ({ dealId, dealStatus, onTradeUpdate }) => {
    const [tradeIn, setTradeIn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Only show in Showroom and Negotiation stages
    const showTradeIn = ['showroom', 'negotiation'].includes(dealStatus?.toLowerCase());

    useEffect(() => {
      if (showTradeIn && dealId) {
        // Check if it's a mock deal ID (not a valid MongoDB ObjectId)
        if (!dealId.match(/^[0-9a-fA-F]{24}$/)) {
          setLoading(false);  // Skip API call for mock data
          return;
        }
        fetchTradeIn();
      } else {
        setLoading(false);
      }
    }, [dealId, showTradeIn]);

    const fetchTradeIn = async () => {
      try {
        const response = await fetch(`/api/tradein/deal/${dealId}`);
        if (response.ok) {
          const data = await response.json();
          setTradeIn(data);
        }
      } catch (error) {
        console.error('Error fetching trade-in:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSaveTradeIn = (savedTradeIn) => {
      setTradeIn(savedTradeIn);
      if (onTradeUpdate) {
        onTradeUpdate(savedTradeIn);
      }
    };

    if (!showTradeIn) return null;

    if (loading) {
      return (
        <div className="trade-in-display">
          <div className="trade-in-header">
            <Car size={16} />
            <span>Loading trade-in...</span>
          </div>
        </div>
      );
    }

    if (!tradeIn) {
      return (
        <div className="trade-in-display no-trade">
          <button className="add-trade-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add Trade-In
          </button>
          {showForm && (
            <TradeInForm
              dealId={dealId}
              onClose={() => setShowForm(false)}
              onSave={handleSaveTradeIn}
            />
          )}
        </div>
      );
    }

    const hasAlerts = Object.values(tradeIn.flags || {}).some(flag => flag);

    return (
      <>
        <div className={`trade-in-display ${expanded ? 'expanded' : ''} ${hasAlerts ? 'has-alerts' : ''}`}>
          <div
            className="trade-in-header"
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: 'pointer' }}
          >
            <div className="trade-header-left">
              <Car size={16} />
              <span className="trade-vehicle">
                {tradeIn.year} {tradeIn.make} {tradeIn.model}
              </span>
              {hasAlerts && <AlertTriangle size={14} className="alert-icon" />}
            </div>
            <div className="trade-header-right">
              <span className="trade-allowance">
                ${(tradeIn.allowance || 0).toLocaleString()}
              </span>
              <button
                className="edit-trade-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowForm(true);
                }}
              >
                <Edit size={14} />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="trade-in-details">
              <div className="trade-info-grid">
                <div className="trade-info-item">
                  <span className="label">Mileage:</span>
                  <span className="value">{tradeIn.mileage?.toLocaleString()} mi</span>
                </div>
                <div className="trade-info-item">
                  <span className="label">Condition:</span>
                  <span className={`value condition-${tradeIn.condition}`}>
                    {tradeIn.condition}
                  </span>
                </div>
                {tradeIn.vin && (
                  <div className="trade-info-item">
                    <span className="label">VIN:</span>
                    <span className="value">{tradeIn.vin}</span>
                  </div>
                )}
              </div>

              <div className="trade-values">
                <div className="value-row">
                  <span>ACV:</span>
                  <strong>${(tradeIn.acv || 0).toLocaleString()}</strong>
                </div>
                <div className="value-row">
                  <span>Allowance:</span>
                  <strong>${(tradeIn.allowance || 0).toLocaleString()}</strong>
                </div>
                <div className={`value-row ${tradeIn.overAllowance > 0 ? 'over-allowance' : ''}`}>
                  <span>Over/Under:</span>
                  <strong>${(tradeIn.overAllowance || 0).toLocaleString()}</strong>
                </div>
                {tradeIn.payoff > 0 && (
                  <>
                    <div className="value-row">
                      <span>Payoff:</span>
                      <strong>${tradeIn.payoff.toLocaleString()}</strong>
                    </div>
                    <div className={`value-row ${tradeIn.equity < 0 ? 'negative-equity' : ''}`}>
                      <span>Equity:</span>
                      <strong>${(tradeIn.equity || 0).toLocaleString()}</strong>
                    </div>
                  </>
                )}
              </div>

              {/* Book Values if available */}
              {hasBookValues(tradeIn) && (
                <div className="book-value-summary">
                  <div className="book-value-header">
                    <DollarSign size={14} />
                    <span>Book Values</span>
                  </div>
                  <div className="book-value-list">
                    {tradeIn.bookValues.nada?.average > 0 && (
                      <div className="book-value-item">
                        <span>NADA:</span>
                        <span>${tradeIn.bookValues.nada.average.toLocaleString()}</span>
                      </div>
                    )}
                    {tradeIn.bookValues.kbb?.tradein > 0 && (
                      <div className="book-value-item">
                        <span>KBB:</span>
                        <span>${tradeIn.bookValues.kbb.tradein.toLocaleString()}</span>
                      </div>
                    )}
                    {tradeIn.bookValues.blackbook?.average > 0 && (
                      <div className="book-value-item">
                        <span>Black Book:</span>
                        <span>${tradeIn.bookValues.blackbook.average.toLocaleString()}</span>
                      </div>
                    )}
                    {tradeIn.bookValues.vauto?.marketValue > 0 && (
                      <div className="book-value-item">
                        <span>vAuto:</span>
                        <span>${tradeIn.bookValues.vauto.marketValue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {hasAlerts && (
                <div className="trade-alerts">
                  {tradeIn.flags.overAllowanceAlert && (
                    <div className="alert-item">
                      <AlertTriangle size={12} />
                      Over-allowance exceeds $500
                    </div>
                  )}
                  {tradeIn.flags.payoffAlert && (
                    <div className="alert-item">
                      <AlertTriangle size={12} />
                      Negative equity exceeds $1,000
                    </div>
                  )}
                  {tradeIn.flags.conditionAlert && (
                    <div className="alert-item">
                      <AlertTriangle size={12} />
                      Vehicle in poor condition
                    </div>
                  )}
                  {tradeIn.flags.priceVarianceAlert && (
                    <div className="alert-item">
                      <AlertTriangle size={12} />
                      ACV varies significantly from book values
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {showForm && (
          <TradeInForm
            dealId={dealId}
            onClose={() => setShowForm(false)}
            onSave={handleSaveTradeIn}
            existingTradeIn={tradeIn}
          />
        )}
      </>
    );
  };

  // Helper function to check if any book values exist
  const hasBookValues = (tradeIn) => {
    if (!tradeIn.bookValues) return false;

    return (
      tradeIn.bookValues.nada?.average > 0 ||
      tradeIn.bookValues.kbb?.tradein > 0 ||
      tradeIn.bookValues.blackbook?.average > 0 ||
      tradeIn.bookValues.vauto?.marketValue > 0
    );
  };

  export default TradeInDisplay;
