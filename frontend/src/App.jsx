  /**
   * Flightline™ - Dealership Command Center
   * Copyright (c) 2025 JL Robinson. All Rights Reserved.
   *
   * This file is proprietary and confidential.
   */

  import React, { useState, useEffect } from 'react';
  import CustomizableDashboard from './components/Dashboard/FloatingDashboard';
  import FlightlineMobile from './components/Mobile/FlightlineMobile';
  import './App.css';

  const detectMobile = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);

    return width <= 768 || isMobileDevice;
  };

  function App() {
    const [isMobile, setIsMobile] = useState(detectMobile);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(detectMobile());
      };

      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
      <div className="app">
        {isMobile ? <FlightlineMobile /> : <CustomizableDashboard />}
      </div>
    );
  }

  export default App;
