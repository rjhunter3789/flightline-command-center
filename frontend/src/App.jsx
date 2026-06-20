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

  function App() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      // Check if device is mobile
      const checkMobile = () => {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
        setIsMobile(width <= 768 || isMobileDevice);
      };

      checkMobile();
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
