 import React, { useState, useEffect } from 'react';
  import { X, User, Car, DollarSign, FileText, Clock, Eye, EyeOff, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
  import './DealDetails.css';
  import { isRBACEnabled, canViewPII, canEditDeals } from '../../utils/roleUtils';
  const DealDetails = ({ dealId, deal: initialDeal, onClose }) => {
    const [deal, setDeal] = useState(initialDeal || null);
    const [loading, setLoading] = useState(!initialDeal);
    const [activeTab, setActiveTab] = useState('customer');
    const [showPII, setShowPII] = useState(false);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
      fetchDealDetails();
    }, [dealId]);

    const fetchDealDetails = async () => {
      try {
        // Skip API call if we already have deal data or for mock deals
        if (initialDeal || !dealId || dealId.includes('test')) {
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/deals/${dealId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const dealData = await response.json();
          setDeal(dealData);
        }
      } catch (error) {
        console.error('Error fetching deal details:', error);
      } finally {
        setLoading(false);
      }
    };

  const maskPhone = (phone) => {
    if (!phone) return phone;
    // Always mask if RBAC is enabled and user doesn't have PII permission
    if (isRBACEnabled() && !canViewPII()) return phone.replace(/(\d{3})\d{3}(\d{4})/, '$1-XXX-$2');
    // Otherwise, respect the showPII toggle
    if (!showPII) return phone.replace(/(\d{3})\d{3}(\d{4})/, '$1-XXX-$2');
    return phone;
  };    

   const maskEmail = (email) => {
    if (!email) return email;
    if (isRBACEnabled() && !canViewPII()) {
      const [local, domain] = email.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    if (!showPII) {
      const [local, domain] = email.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    return email;
   };

    const maskLicense = (license) => {
    if (!license) return license;
    if (isRBACEnabled() && !canViewPII()) return `***${license.slice(-4)}`;
    if (!showPII) return `***${license.slice(-4)}`;
    return license;
  };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleAddNote = async () => {
      if (!newNote.trim()) return;

      try {
        const response = await fetch(`/api/deals/${dealId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ note: newNote })
        });

        if (response.ok) {
          setNewNote('');
          fetchDealDetails(); // Refresh to show new note
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    };

    if (loading) {
      return (
        <div className="deal-details-overlay">
          <div className="deal-details-modal">
            <div className="loading-state">Loading deal details...</div>
          </div>
        </div>
      );
    }

    if (!deal) {
      return (
        <div className="deal-details-overlay">
          <div className="deal-details-modal">
            <div className="error-state">Failed to load deal details</div>
          </div>
        </div>
      );
    }

    return (
      <div className="deal-details-overlay">
        <div className="deal-details-modal">
          <div className="deal-details-header">
            <h2>Deal Details - {deal.stockNumber || deal._id}</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>

          <div className="deal-details-subheader">
            <div className="customer-name">{deal.customerName}</div>
            <div className="deal-stage">
              <span className={`stage-badge ${deal.stage?.toLowerCase()}`}>
                {deal.stage}
              </span>
            </div>
          </div>

          <div className="deal-details-tabs">
            <button
              className={`tab ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              <User size={16} /> Customer
            </button>
            <button
              className={`tab ${activeTab === 'deal' ? 'active' : ''}`}
              onClick={() => setActiveTab('deal')}
            >
              <Car size={16} /> Deal Info
            </button>
            <button
              className={`tab ${activeTab === 'tradein' ? 'active' : ''}`}
              onClick={() => setActiveTab('tradein')}
            >
              <TrendingUp size={16} /> Trade-In
            </button>
            <button
              className={`tab ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
            >
              <DollarSign size={16} /> Finance
            </button>
            <button
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Clock size={16} /> Activity
            </button>
          </div>

          <div className="deal-details-content">
            {activeTab === 'customer' && (
              <div className="tab-content">
              {(!isRBACEnabled() || canViewPII()) && (
                    <div className="pii-toggle">
                      <button onClick={() => setShowPII(!showPII)} className="pii-toggle-btn">
                        {showPII ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPII ? 'Hide' : 'Show'} Sensitive Information
                      </button>
                    </div>
                  )}

                <div className="info-grid">
                  <div className="info-section">
                    <h3>Contact Information</h3>
                    <div className="info-row">
                      <label>Phone:</label>
                      <span>{maskPhone(deal.customerPhone) || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <label>Email:</label>
                      <span>{maskEmail(deal.customerEmail) || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <label>Address:</label>
                      <span>{deal.customerAddress || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>Additional Details</h3>
                    <div className="info-row">
                      <label>Driver's License:</label>
                      <span>{maskLicense(deal.driversLicense) || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <label>Insurance:</label>
                      <span>{deal.insurance || 'Not verified'}</span>
                    </div>
                    <div className="info-row">
                      <label>Sales Person:</label>
                      <span>{deal.salesPerson}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deal' && (
              <div className="tab-content">
                <div className="info-grid">
                  <div className="info-section">
                    <h3>Vehicle Information</h3>
                    <div className="info-row">
                      <label>Stock #:</label>
                      <span>{deal.stockNumber}</span>
                    </div>
                    <div className="info-row">
                      <label>VIN:</label>
                      <span className="vin">{deal.vin || 'Not provided'}</span>
                    </div>
                    <div className="info-row">
                      <label>Vehicle:</label>
                      <span>{`${deal.year} ${deal.make} ${deal.model}`}</span>
                    </div>
                    <div className="info-row">
                      <label>Color:</label>
                      <span>{deal.color || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>Deal Structure</h3>
                    <div className="info-row">
                      <label>Sales Price:</label>
                      <span className="currency">{formatCurrency(deal.sellingPrice)}</span>
                    </div>
                    <div className="info-row">
                      <label>Gross Profit:</label>
                      <span className={`currency ${deal.grossProfit < 0 ? 'negative' : 'positive'}`}>
                        {formatCurrency(deal.grossProfit)}
                      </span>
                    </div>
                    {deal.adjustedGrossProfit && (
                      <div className="info-row">
                        <label>Adjusted Gross:</label>
                        <span className={`currency ${deal.adjustedGrossProfit < 0 ? 'negative' : 'positive'}`}>
                          {formatCurrency(deal.adjustedGrossProfit)}
                        </span>
                      </div>
                    )}
                    <div className="info-row">
                      <label>Deal Type:</label>
                      <span>{deal.dealType || 'Cash'}</span>
                    </div>
                  </div>
                </div>

                {deal.grossProfit && (
                  <div className="profit-breakdown">
                    <h3>Gross Profit Breakdown</h3>
                    <div className="breakdown-items">
                      <div className="breakdown-item">
                        <span>Base Gross:</span>
                        <span>{formatCurrency(deal.grossProfit)}</span>
                      </div>
                      {deal.hasTradeIn && (
                        <div className="breakdown-item">
                          <span>Trade Over-Allowance:</span>
                          <span className="negative">{formatCurrency(-deal.tradeInOverAllowance)}</span>
                        </div>
                      )}
                      <div className="breakdown-item total">
                        <span>Total Gross:</span>
                        <span className={deal.adjustedGrossProfit < 0 ? 'negative' : 'positive'}>
                          {formatCurrency(deal.adjustedGrossProfit || deal.grossProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tradein' && (
              <div className="tab-content">
                {deal.hasTradeIn ? (
                  <div className="info-grid">
                    <div className="info-section">
                      <h3>Trade-In Vehicle</h3>
                      <div className="info-row">
                        <label>Vehicle:</label>
                        <span>{deal.tradeInVehicle || 'See trade-in details'}</span>
                      </div>
                      <div className="info-row">
                        <label>ACV:</label>
                        <span className="currency">{formatCurrency(deal.tradeInACV)}</span>
                      </div>
                      <div className="info-row">
                        <label>Allowance:</label>
                        <span className="currency">{formatCurrency(deal.tradeInAllowance)}</span>
                      </div>
                      <div className="info-row">
                        <label>Over-Allowance:</label>
                        <span className={`currency ${deal.tradeInOverAllowance > 0 ? 'negative' : ''}`}>
                          {formatCurrency(deal.tradeInOverAllowance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Car size={48} />
                    <p>No trade-in on this deal</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="tab-content">
                <div className="info-grid">
                  <div className="info-section">
                    <h3>Financing Details</h3>
                    <div className="info-row">
                      <label>Type:</label>
                      <span>{deal.financeType || 'Cash'}</span>
                    </div>
                    <div className="info-row">
                      <label>Lender:</label>
                      <span>{deal.lender || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <label>Term:</label>
                      <span>{deal.term ? `${deal.term} months` : 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <label>Rate:</label>
                      <span>{deal.rate ? `${deal.rate}%` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>Payment Information</h3>
                    <div className="info-row">
                      <label>Down Payment:</label>
                      <span className="currency">{formatCurrency(deal.downPayment)}</span>
                    </div>
                    <div className="info-row">
                      <label>Monthly Payment:</label>
                      <span className="currency">{formatCurrency(deal.monthlyPayment)}</span>
                    </div>
                    <div className="info-row">
                      <label>Amount Financed:</label>
                      <span className="currency">
                        {formatCurrency((deal.sellingPrice || 0) - (deal.downPayment || 0) + (deal.tradeInOverAllowance || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="tab-content">
              {(!isRBACEnabled() || canEditDeals()) && (
                    <div className="activity-section">
                      <h3>Add Note</h3>
                      <div className="note-input-group">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note about this deal..."
                          rows="3"
                        />
                        <button onClick={handleAddNote} className="add-note-btn">
                          Add Note
                        </button>
                      </div>
                    </div>
                  )}                

                <div className="activity-timeline">
                  <h3>Deal Timeline</h3>
                  {deal.stageHistory?.map((stage, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-stage">{stage.stage}</span>
                          <span className="timeline-date">{formatDate(stage.timestamp)}</span>
                        </div>
                        {stage.note && <div className="timeline-note">{stage.note}</div>}
                      </div>
                    </div>
                  ))}

                  {(!deal.stageHistory || deal.stageHistory.length === 0) && (
                    <div className="empty-state">
                      <Clock size={48} />
                      <p>No activity recorded yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default DealDetails;
