 import React, { useState, useEffect } from 'react';
  import { Rnd } from 'react-rnd';
  import { useRealTimeData } from '../../hooks/useRealTimeData';
  import MissionStatus from './MissionStatus';
  import DealFlow from './DealFlow';
  import DealCard from './DealCard';
  import AlertSystem from './AlertSystem';
  import { Lock, Unlock, RotateCcw, Save, Maximize2, Minimize2, X } from 'lucide-react';
  import './FloatingDashboard.css';
  import Chat from './Chat';
  import NotificationCenter from './NotificationCenter';

  const FloatingDashboard = () => {
    const { deals, alerts, stats, loading } = useRealTimeData();
    const [selectedStage, setSelectedStage] = useState('all');
    const [editMode, setEditMode] = useState(false);
    const [windows, setWindows] = useState({
      missionStatus: {
        x: 20, y: 80, width: 350, height: 400,
        visible: true, minimized: false, zIndex: 1
      },
      dealFlow: {
        x: 390, y: 80, width: 800, height: 200,
        visible: true, minimized: false, zIndex: 2
      },
      dealCards: {
        x: 390, y: 300, width: 800, height: 400,
        visible: true, minimized: false, zIndex: 3
      },
      alerts: {
        x: 20, y: 500, width: 350, height: 200,
        visible: true, minimized: false, zIndex: 4
      },
        chat: {
          x: 1210, y: 80, width: 500, height: 600,
          visible: true, minimized: false, zIndex: 5
      }
    });

    const [activeWindow, setActiveWindow] = useState(null);

    // Load saved positions
    useEffect(() => {
      const saved = localStorage.getItem('flightline-floating-layout');
      if (saved) {
        setWindows(JSON.parse(saved));
      }
    }, []);

    const filteredDeals = selectedStage === 'all'
      ? deals
      : deals.filter(deal => deal.stage === selectedStage);

    const updateWindow = (id, updates) => {
      setWindows(prev => ({
        ...prev,
        [id]: { ...prev[id], ...updates }
      }));
    };

    const bringToFront = (id) => {
      const maxZ = Math.max(...Object.values(windows).map(w => w.zIndex));
      updateWindow(id, { zIndex: maxZ + 1 });
      setActiveWindow(id);
    };

    const saveLayout = () => {
      localStorage.setItem('flightline-floating-layout', JSON.stringify(windows));
      alert('Layout saved!');
    };

    const resetLayout = () => {
      if (window.confirm('Reset to default layout?')) {
        localStorage.removeItem('flightline-floating-layout');
        window.location.reload();
      }
    };

    const toggleMinimize = (id) => {
      updateWindow(id, { minimized: !windows[id].minimized });
    };

    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Initializing Command Center...</p>
        </div>
      );
    }

    const renderWindow = (id, title, content) => {
      const window = windows[id];
      if (!window.visible) return null;

      return (
        <Rnd
          key={id}
          position={{ x: window.x, y: window.y }}
          size={{ width: window.width, height: window.minimized ? 40 : window.height }}
          onDragStop={(e, d) => updateWindow(id, { x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateWindow(id, {
              width: ref.style.width,
              height: ref.style.height,
              ...position,
            });
          }}
          minWidth={250}
          minHeight={window.minimized ? 40 : 150}
          bounds="parent"
          dragHandleClassName="window-header"
          enableResizing={!window.minimized && editMode}
          disableDragging={!editMode}
          style={{ zIndex: window.zIndex }}
          onMouseDown={() => bringToFront(id)}
          className={`floating-window ${activeWindow === id ? 'active' : ''}`}
        >
          <div className="window-container">
            <div className="window-header">
              <span className="window-title">{title}</span>
              <div className="window-controls">
                <button onClick={() => toggleMinimize(id)} className="window-btn">
                  {window.minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                {editMode && (
                  <button onClick={() => updateWindow(id, { visible: false })} className="window-btn close">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            {!window.minimized && (
              <div className="window-content">
                {content}
              </div>
            )}
          </div>
        </Rnd>
      );
    };

    return (
      <div className="floating-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span className="icon-tower">🗼</span>
            Flightline Command Center
          </h1>

          <NotificationCenter />

          <div className="dashboard-controls">
            <div className="dashboard-time">
               <div>{new Date().toLocaleDateString()}</div>
               <div>{new Date().toLocaleTimeString()}</div>
            </div>

            <div className="layout-controls">
              {editMode && (
                <>
                  <button className="control-btn save-btn" onClick={saveLayout}>
                    <Save size={16} /> Save Layout
                  </button>
                  <button className="control-btn reset-btn" onClick={resetLayout}>
                    <RotateCcw size={16} /> Reset
                  </button>
                </>
              )}

              <button
                className={`control-btn edit-btn ${editMode ? 'active' : ''}`}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <Lock size={16} /> : <Unlock size={16} />}
                {editMode ? 'Lock Windows' : 'Edit Layout'}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-workspace">
          {renderWindow('missionStatus', 'Mission Status',
            <MissionStatus stats={stats} alerts={alerts} />
          )}

          {renderWindow('dealFlow', 'Deal Flow Pipeline',
            <DealFlow
              deals={deals}
              onStageSelect={setSelectedStage}
              selectedStage={selectedStage}
            />
          )}

          {renderWindow('dealCards', `Active Deals - ${selectedStage === 'all' ? 'All Stages' : selectedStage}`,
            <div className="deal-cards-container">
              <div className="deal-cards-grid">
                {filteredDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </div>
          )}

          {renderWindow('alerts', 'System Alerts',
            <AlertSystem alerts={alerts} />
          )}

          {renderWindow('chat', 'Team Chat',
            <Chat />
          )}
        </div>

        <div className="dashboard-footer">
          <p>© 2025 JL Robinson. All Rights Reserved. Flightline™ is a trademark of JL Robinson.</p>
        </div>
      </div>
    );
  };

  export default FloatingDashboard;
