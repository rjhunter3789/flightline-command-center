  /**
   * Flightline™ - Mobile Command Center
   * Copyright (c) 2025 JL Robinson. All Rights Reserved.
   *
   * This file is proprietary and confidential.
   */

  import React, { useState, useEffect } from 'react';
  import { useWebSocket } from '../../hooks/useWebSocket';
  import './FlightlineMobile.css';

  const dealStages = [
    "Showroom",
    "Test Drive",
    "Negotiation",
    "F&I Office"
  ];


  const demoDeals = [
    {
      id: "demo-1001",
      stockNumber: "F-1001",
      status: "Negotiation",
      stage: "Negotiation",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      customer: { name: "Demo Customer" },
      vehicle: { year: 2025, make: "Ford", model: "F-150" },
      salesperson: "Alex Morgan",
      salePrice: 52500,
      appointmentTime: new Date().toISOString(),
      interactions: [{ type: "note" }, { type: "manager-review" }]
    },
    {
      id: "demo-1002",
      stockNumber: "F-1002",
      status: "Test Drive",
      stage: "Test Drive",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      customer: { name: "Showroom Guest" },
      vehicle: { year: 2025, make: "Ford", model: "Explorer" },
      salesperson: "Jamie Lee",
      salePrice: 0,
      interactions: [{ type: "test-drive" }]
    },
    {
      id: "demo-1003",
      stockNumber: "F-1003",
      status: "F&I Office",
      stage: "F&I Office",
      createdAt: new Date(Date.now() - 1000 * 60 * 135).toISOString(),
      customer: { name: "Delivery Pending" },
      vehicle: { year: 2024, make: "Ford", model: "Bronco Sport" },
      salesperson: "Taylor Smith",
      salePrice: 38400,
      interactions: [{ type: "finance" }, { type: "docs" }, { type: "delivery" }]
    }
  ];

  const demoDealership = {
    name: "Flightline Demo"
  };

  const primaryCtas = [
    {
      id: "activeDeals",
      label: "Active Deals",
      description: "See all live showroom, test drive, and F&I deals."
    },
    {
      id: "dealFlow",
      label: "Deal Flow Pipeline",
      description: "Totals by stage in the pipeline."
    },
    {
      id: "snapshot",
      label: "Today's Snapshot",
      description: "Volume, sales, appointments, and targets."
    },
    {
      id: "staffActivity",
      label: "Staff Activity",
      description: "Touches, follow ups, and gaps."
    },
    {
      id: "chatSentiment",
      label: "Chats & Sentiment",
      description: "Live chat volume and sentiment trend."
    }
  ];

  const FlightlineMobile = () => {
    const [selectedCta, setSelectedCta] = useState("activeDeals");
    const [selectedStage, setSelectedStage] = useState("Negotiation");
    const [deals, setDeals] = useState(demoDeals);
    const [dealership, setDealership] = useState(demoDealership);

    const socket = useWebSocket();

    useEffect(() => {
      // Fetch initial data
      fetchDeals();
      fetchDealership();
    }, []);

    useEffect(() => {
      if (socket) {
        // Listen for real-time deal updates
        socket.on('deal:update', (updatedDeal) => {
          setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === updatedDeal.id ? updatedDeal : deal
            )
          );
        });

        socket.on('deal:new', (newDeal) => {
          setDeals(prevDeals => [...prevDeals, newDeal]);
        });

        socket.on('deal:statusChange', ({ dealId, newStatus }) => {
          setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === dealId ? { ...deal, stage: newStatus } : deal
            )
          );
        });

        return () => {
          socket.off('deal:update');
          socket.off('deal:new');
          socket.off('deal:statusChange');
        };
      }
    }, [socket]);

    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDeals(data);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };

    const fetchDealership = async () => {
      try {
        const response = await fetch('/api/dealership', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDealership(data);
        }
      } catch (error) {
        console.error('Error fetching dealership:', error);
      }
    };

    const getDealsForStage = (stage) => {
      return deals.filter(deal => deal.status === stage || deal.stage === stage);
    };

    const countsByStage = dealStages.reduce((acc, stage) => {
      acc[stage] = getDealsForStage(stage).length;
      return acc;
    }, {});

    return (
      <div className="flightline-mobile">
        {/* Header */}
        <header className="mobile-header">
          <div className="header-content">
            <h1 className="mobile-title">Flightline</h1>
            <p className="mobile-subtitle">Mobile command for deal flow</p>
          </div>
          <span className="dealer-badge">
            {dealership?.name || 'Flightline Demo'}
          </span>
        </header>

        {/* Primary CTAs */}
        <section className="cta-section">
          <h2 className="section-title">Quick actions</h2>
          <div className="cta-grid">
            {primaryCtas.map((cta) => {
              const isActive = cta.id === selectedCta;
              return (
                <button
                  key={cta.id}
                  onClick={() => setSelectedCta(cta.id)}
                  className={`cta-button ${isActive ? 'active' : ''}`}
                >
                  <div className="cta-label">{cta.label}</div>
                  <div className="cta-description">{cta.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Content Based on Selected CTA */}
        {selectedCta === "activeDeals" && (
          <ActiveDealsSection
            selectedStage={selectedStage}
            onStageChange={setSelectedStage}
            deals={getDealsForStage(selectedStage)}
            countsByStage={countsByStage}
          />
        )}

        {selectedCta === "dealFlow" && (
          <DealFlowTotalsSection countsByStage={countsByStage} />
        )}

        {selectedCta === "snapshot" && (
          <TodaySnapshotSection deals={deals} />
        )}

        {selectedCta === "staffActivity" && (
          <StaffActivitySection deals={deals} />
        )}

        {selectedCta === "chatSentiment" && (
          <ChatSentimentSection />
        )}
      </div>
    );
  };

  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {
    const handleDealClick = (dealId) => {
      // Navigate to deal details
      window.location.href = `/deal/${dealId}`;
    };

    return (
      <section className="deals-section">
        <div className="section-header">
          <h2 className="section-title">Active deals</h2>
          <p className="section-hint">Tap a stage, then tap a deal</p>
        </div>

        {/* Stage Pills */}
        <div className="stage-pills">
          {dealStages.map((stage) => {
            const isActive = stage === selectedStage;
            const count = countsByStage[stage] || 0;
            return (
              <button
                key={stage}
                onClick={() => onStageChange(stage)}
                className={`stage-pill ${isActive ? 'active' : ''}`}
              >
                {stage} ({count})
              </button>
            );
          })}
        </div>

        {/* Deals List */}
        <div className="deals-list">
          {deals.length === 0 && (
            <div className="no-deals">
              No active deals in {selectedStage}.
            </div>
          )}

          {deals.map((deal) => (
            <button
              key={deal.id}
              className="deal-card"
              onClick={() => handleDealClick(deal.id)}
            >
              <div className="deal-header">
                <div className="deal-id">
                  {deal.stockNumber} - {deal.customer?.name || 'Unknown Customer'}
                </div>
                <div className="deal-stage">{deal.status || deal.stage}</div>
              </div>
              <div className="deal-vehicle">
                {deal.vehicle?.year} {deal.vehicle?.make} {deal.vehicle?.model}
              </div>
              <div className="deal-footer">
                <span>Sales: {deal.salesperson || 'Unassigned'}</span>
                <span>Age: {calculateDealAge(deal.createdAt)} hrs</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  };

  const DealFlowTotalsSection = ({ countsByStage }) => {
    return (
      <section className="totals-section">
        <h2 className="section-title">Deal flow pipeline</h2>
        <div className="totals-grid">
          {dealStages.map((stage) => (
            <div key={stage} className="total-card">
              <div className="total-label">{stage}</div>
              <div className="total-count">{countsByStage[stage] || 0}</div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const TodaySnapshotSection = ({ deals }) => {
    const todayDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt);
      const today = new Date();
      return dealDate.toDateString() === today.toDateString();
    });

    const metrics = {
      totalDeals: todayDeals.length,
      closedDeals: todayDeals.filter(d => d.status === 'closed').length,
      revenue: todayDeals
        .filter(d => d.status === 'closed')
        .reduce((sum, d) => sum + (d.salePrice || 0), 0),
      appointments: todayDeals.filter(d => d.appointmentTime).length
    };

    return (
      <section className="snapshot-section">
        <h2 className="section-title">Today's Snapshot</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Deals</div>
            <div className="metric-value">{metrics.totalDeals}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Closed</div>
            <div className="metric-value">{metrics.closedDeals}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Revenue</div>
            <div className="metric-value">${metrics.revenue.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Appointments</div>
            <div className="metric-value">{metrics.appointments}</div>
          </div>
        </div>
      </section>
    );
  };

  const StaffActivitySection = ({ deals }) => {
    // Group deals by salesperson
    const staffMetrics = deals.reduce((acc, deal) => {
      const staff = deal.salesperson || 'Unassigned';
      if (!acc[staff]) {
        acc[staff] = {
          name: staff,
          activeDeals: 0,
          closedToday: 0,
          touchpoints: 0
        };
      }
      acc[staff].activeDeals++;
      if (deal.status === 'closed' && isToday(deal.closedAt)) {
        acc[staff].closedToday++;
      }
      acc[staff].touchpoints += deal.interactions?.length || 0;
      return acc;
    }, {});

    return (
      <section className="staff-section">
        <h2 className="section-title">Staff Activity</h2>
        <div className="staff-list">
          {Object.values(staffMetrics).map((staff) => (
            <div key={staff.name} className="staff-card">
              <div className="staff-name">{staff.name}</div>
              <div className="staff-metrics">
                <span>Active: {staff.activeDeals}</span>
                <span>Closed: {staff.closedToday}</span>
                <span>Touches: {staff.touchpoints}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const ChatSentimentSection = () => {
    const [chatMetrics, setChatMetrics] = useState({
      activeChats: 0,
      sentiment: 'positive',
      volume: 0
    });

    useEffect(() => {
      // Fetch chat metrics
      fetchChatMetrics();
    }, []);

    const fetchChatMetrics = async () => {
      try {
        const response = await fetch('/api/chat/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setChatMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching chat metrics:', error);
      }
    };

    return (
      <section className="chat-section">
        <h2 className="section-title">Chats & Sentiment</h2>
        <div className="chat-metrics">
          <div className="metric-card">
            <div className="metric-label">Active Chats</div>
            <div className="metric-value">{chatMetrics.activeChats}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Sentiment</div>
            <div className={`metric-value sentiment-${chatMetrics.sentiment}`}>
              {chatMetrics.sentiment}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Volume Today</div>
            <div className="metric-value">{chatMetrics.volume}</div>
          </div>
        </div>
      </section>
    );
  };

  // Utility functions
  const calculateDealAge = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hours = (now - created) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  const isToday = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  export default FlightlineMobile;
