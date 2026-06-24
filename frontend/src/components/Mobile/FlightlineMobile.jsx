  /**
   * FlightLine™ - Mobile Command Center
   * Copyright (c) 2025 JL Robinson. All Rights Reserved.
   *
   * This file is proprietary and confidential.
   */

  import React, { useState, useEffect, useRef } from 'react';
  import { useRealTimeData } from '../../hooks/useRealTimeData';
  import './FlightlineMobile.css';
  import { playPremiumFlightAttendantBriefing, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';

  const dealStages = [
    "Showroom",
    "Test Drive",
    "Negotiation",
    "F&I Office"
  ];

  const normalizeStage = (stage) => {
    const value = String(stage || '').toLowerCase().replace(/&/g, '').replace(/\s+/g, '_');
    if (value === 'test_drive') return 'Test Drive';
    if (value === 'finance' || value === 'fi_office' || value === 'f_i_office') return 'F&I Office';
    if (value === 'negotiation') return 'Negotiation';
    if (value === 'showroom') return 'Showroom';
    return stage || 'Unknown';
  };

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
    name: "FlightLine Demo"
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
    const { deals: desktopDeals } = useRealTimeData();
    const [mobileFallbackDeals, setDeals] = useState(demoDeals);
    const deals = desktopDeals && desktopDeals.length ? desktopDeals : mobileFallbackDeals;
    const [dealership, setDealership] = useState(demoDealership);

    const socket = null; // Mobile MVP demo mode: live WebSocket disabled until authenticated pilot flow is ready

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

    const getDealStage = (deal) => normalizeStage(deal.status || deal.stage);

    const getDealsForStage = (stage) => {
      return deals.filter(deal => getDealStage(deal) === stage);
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
            <h1 className="mobile-title">FlightLine</h1>
            <p className="mobile-subtitle">Mobile command for deal flow</p>
          </div>
          <span className="dealer-badge">
            {dealership?.name || 'FlightLine Demo'}
          </span>
        </header>

        <FlightAttendantSection
          deals={deals}
          countsByStage={countsByStage}
        />

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
          <DealFlowTotalsSection
            countsByStage={countsByStage}
            onStageSelect={(stage) => {
              setSelectedStage(stage);
              setSelectedCta("activeDeals");
            }}
          />
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

  const getDealGrossValue = (deal) => Number(deal.grossProfit || deal.salePrice || 0);

  const getCustomerName = (deal) => deal.customer?.name || deal.customerName || 'Unknown customer';

  const getVehicleLabel = (deal) => {
    const year = deal.vehicle?.year || deal.vehicleYear || '';
    const make = deal.vehicle?.make || deal.vehicleMake || '';
    const model = deal.vehicle?.model || deal.vehicleModel || '';
    return `${year} ${make} ${model}`.trim() || 'vehicle';
  };

  const getDealTimeLabel = (deal) => deal.timeInStage || `${calculateDealAge(deal.createdAt)} hours`;

  const getHighestGrossDeal = (deals) => {
    return [...deals].sort((a, b) => getDealGrossValue(b) - getDealGrossValue(a))[0];
  };

  const getAttentionDeals = (deals) => {
    return deals
      .filter((deal) => {
        const stage = normalizeStage(deal.status || deal.stage);
        const urgency = String(deal.urgency || '').toLowerCase();
        return urgency === 'high' || stage === 'Negotiation' || stage === 'Test Drive';
      })
      .slice(0, 3);
  };

  const choosePreferredVoice = (voices) => {
    if (!voices || !voices.length) return null;

    const preferredNames = [
      'Samantha',
      'Karen',
      'Moira',
      'Tessa',
      'Daniel',
      'Google US English',
      'Microsoft Jenny',
      'Microsoft Aria'
    ];

    return voices.find((voice) => preferredNames.some((name) => voice.name.includes(name)))
      || voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en-us'))
      || voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('en'))
      || voices[0];
  };

  const getSpeechRecognitionApi = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const normalizeFlightAttendantCommand = (text = '') => {
    return String(text)
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const mapFlightAttendantVoiceCommand = (text = '') => {
    const command = normalizeFlightAttendantCommand(text);

    if (!command) return null;

    if (command.includes('stop speaking') || command.includes('stop playback') || command === 'stop') {
      return { action: 'stop', label: 'Stop Speaking' };
    }

    if (command.includes('active deal summary') || command.includes('active deals') || command.includes('active deal')) {
      return { action: 'briefing', briefingType: 'activeDeals', label: 'Active Deal Summary' };
    }

    if (command.includes('deal flow') || command.includes('pipeline')) {
      return { action: 'briefing', briefingType: 'dealFlow', label: 'Deal Flow Summary' };
    }

    if (command.includes("today's snapshot") || command.includes('todays snapshot') || command.includes('snapshot')) {
      return { action: 'briefing', briefingType: 'snapshot', label: "Today's Snapshot" };
    }

    if (command.includes('what needs attention') || command.includes('needs attention') || command.includes('attention')) {
      return { action: 'briefing', briefingType: 'attention', label: 'What Needs Attention' };
    }

    return null;
  };

  const buildFlightAttendantBriefing = (type, deals, countsByStage, mode = 'standard') => {
    const totalDeals = deals.length;
    const showroom = countsByStage.Showroom || 0;
    const testDrive = countsByStage['Test Drive'] || 0;
    const negotiation = countsByStage.Negotiation || 0;
    const finance = countsByStage['F&I Office'] || 0;
    const highUrgency = deals.filter((deal) => String(deal.urgency || '').toLowerCase() === 'high').length;
    const highProbability = deals.filter((deal) => (deal.probability || 0) >= 90).length;
    const revenue = deals.reduce((sum, deal) => sum + getDealGrossValue(deal), 0);
    const appointments = deals.filter((deal) => normalizeStage(deal.status || deal.stage) === 'Test Drive' || deal.appointmentTime).length;
    const highestGrossDeal = getHighestGrossDeal(deals);
    const attentionDeals = getAttentionDeals(deals);
    const isShort = mode === 'short';

    if (!totalDeals) {
      return 'Flight Attendant: no active deals are currently on the board.';
    }

    if (type === 'activeDeals') {
      if (isShort) {
        return `Active deals: ${totalDeals} total. Showroom ${showroom}, Test Drive ${testDrive}, Negotiation ${negotiation}, F&I ${finance}. ${highUrgency ? `${highUrgency} high urgency.` : 'No high urgency flags.'}`;
      }

      const topLine = `FlightLine active deal summary: you currently have ${totalDeals} active deals. Showroom has ${showroom}, Test Drive has ${testDrive}, Negotiation has ${negotiation}, and F&I has ${finance}.`;
      const urgencyLine = highUrgency ? `There are ${highUrgency} high urgency deals on the board.` : 'There are no high urgency deals flagged right now.';
      const topDealLine = highestGrossDeal
        ? `The highest gross opportunity is ${getCustomerName(highestGrossDeal)} on the ${getVehicleLabel(highestGrossDeal)}, currently in ${normalizeStage(highestGrossDeal.status || highestGrossDeal.stage)}.`
        : '';
      return `${topLine} ${urgencyLine} ${topDealLine}`.trim();
    }

    if (type === 'dealFlow') {
      const busiestStage = Object.entries(countsByStage).sort((a, b) => b[1] - a[1])[0];

      if (isShort) {
        return `Deal flow: Showroom ${showroom}, Test Drive ${testDrive}, Negotiation ${negotiation}, F&I ${finance}. Busiest stage: ${busiestStage?.[0] || 'unknown'}.`;
      }

      return `FlightLine deal flow summary: Showroom has ${showroom}, Test Drive has ${testDrive}, Negotiation has ${negotiation}, and F&I has ${finance}. The busiest stage right now is ${busiestStage?.[0] || 'unknown'} with ${busiestStage?.[1] || 0} deals.`;
    }

    if (type === 'snapshot') {
      if (isShort) {
        return `Snapshot: ${totalDeals} active deals, ${highProbability} high probability, ${appointments} appointment or test drive opportunities, $${revenue.toLocaleString()} gross opportunity.`;
      }

      return `FlightLine today's snapshot: you have ${totalDeals} active deals, ${highProbability} high probability deals, ${appointments} appointment or test drive opportunities, and approximately $${revenue.toLocaleString()} in gross opportunity on the board.`;
    }

    if (type === 'attention') {
      if (!attentionDeals.length) {
        return isShort
          ? `Attention: board looks stable. ${totalDeals} active deals, no obvious high urgency items.`
          : `FlightLine attention summary: the board looks stable. You have ${totalDeals} active deals and no obvious high urgency items flagged.`;
      }

      const firstDeal = attentionDeals[0];

      if (isShort) {
        return `Attention: start with ${getCustomerName(firstDeal)}, ${normalizeStage(firstDeal.status || firstDeal.stage)}, ${getDealTimeLabel(firstDeal)} in stage.`;
      }

      const firstLine = `FlightLine attention summary: I would start with ${getCustomerName(firstDeal)} on the ${getVehicleLabel(firstDeal)}, currently in ${normalizeStage(firstDeal.status || firstDeal.stage)} for ${getDealTimeLabel(firstDeal)}.`;
      const followUpLine = attentionDeals.length > 1
        ? `There are ${attentionDeals.length} deals worth a manager look right now.`
        : 'That is the main deal worth a manager look right now.';
      return `${firstLine} ${followUpLine}`;
    }

    return 'Flight Attendant is ready. Ask for Active Deals, Deal Flow, Today’s Snapshot, or what needs attention.';
  };

  const FlightAttendantSection = ({ deals, countsByStage }) => {
    const [briefing, setBriefing] = useState('Flight Attendant is ready. Choose a briefing below.');
    const [activeBriefing, setActiveBriefing] = useState(null);
    const [briefingMode, setBriefingMode] = useState('short');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
    const [voiceInputStatus, setVoiceInputStatus] = useState('Tap Talk to ask for a read-only briefing.');
    const [recognizedCommand, setRecognizedCommand] = useState('');
    const [isGeneratingPremiumVoice, setIsGeneratingPremiumVoice] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        }
        stopPremiumFlightAttendantAudio();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };
    }, []);

    useEffect(() => {
      if (!('speechSynthesis' in window)) return;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const preferredVoice = choosePreferredVoice(voices);
        if (preferredVoice) {
          setVoiceStatus(`Voice: ${preferredVoice.name}`);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }, []);

    const handleBriefing = (type, mode = briefingMode) => {
      const nextBriefing = buildFlightAttendantBriefing(type, deals, countsByStage, mode);
      setActiveBriefing(type);
      setBriefing(nextBriefing);
      return nextBriefing;
    };

    const handleModeChange = (mode) => {
      setBriefingMode(mode);
      if (activeBriefing) {
        handleBriefing(activeBriefing, mode);
      }
    };

    const stopSpeaking = () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      setIsListening(false);
      stopPremiumFlightAttendantAudio();
      setIsGeneratingPremiumVoice(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceInputStatus('Voice input stopped.');
      setVoiceStatus('Speech stopped');
    };

    const speakWithNativeBrowserVoice = (textToSpeak = briefing) => {
      if (!('speechSynthesis' in window)) {
        setBriefing(`${textToSpeak} Voice readout is not supported in this browser.`);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const preferredVoice = choosePreferredVoice(availableVoices.length ? availableVoices : window.speechSynthesis.getVoices());

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        setVoiceStatus(`Speaking with ${preferredVoice.name}`);
      } else {
        setVoiceStatus('Speaking with default browser voice');
      }

      utterance.rate = briefingMode === 'short' ? 0.92 : 0.88;
      utterance.pitch = 0.82;
      utterance.onend = () => setVoiceStatus(preferredVoice ? `Voice: ${preferredVoice.name}` : 'Native browser voice');
      utterance.onerror = () => setVoiceStatus('Voice readout stopped or unavailable');
      window.speechSynthesis.speak(utterance);
    };

    const speakBriefingText = async (type = activeBriefing || 'activeDeals', mode = briefingMode, textToSpeak = briefing) => {
      if (isGeneratingPremiumVoice) return;

      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      await playPremiumFlightAttendantBriefing({
        briefingType: type,
        mode,
        text: textToSpeak,
        onStatus: setVoiceStatus,
        onPreparing: setIsGeneratingPremiumVoice,
        onFallback: () => speakWithNativeBrowserVoice(textToSpeak)
      });
    };

    const speakBriefing = async () => {
      await speakBriefingText(activeBriefing || 'activeDeals', briefingMode, briefing);
    };

    const runVoiceCommand = async (spokenText) => {
      const mappedCommand = mapFlightAttendantVoiceCommand(spokenText);

      if (!mappedCommand) {
        setVoiceInputStatus('Command not recognized. Try active deals, deal flow, snapshot, or attention.');
        return;
      }

      if (mappedCommand.action === 'stop') {
        stopSpeaking();
        return;
      }

      const nextBriefing = handleBriefing(mappedCommand.briefingType, briefingMode);
      setVoiceInputStatus(`Heard: ${mappedCommand.label}.`);
      await speakBriefingText(mappedCommand.briefingType, briefingMode, nextBriefing);
    };

    const startVoiceInput = () => {
      if (isListening || isGeneratingPremiumVoice) return;

      const SpeechRecognition = getSpeechRecognitionApi();
      if (!SpeechRecognition) {
        setVoiceInputStatus('Voice input is not supported in this browser. Use the briefing buttons or Speak Briefing.');
        return;
      }

      stopPremiumFlightAttendantAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Listening...');

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results || [])
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();

        setRecognizedCommand(transcript);
        setIsListening(false);
        recognitionRef.current = null;
        runVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        recognitionRef.current = null;
        const errorText = event?.error ? `Voice input stopped: ${event.error}.` : 'Voice input stopped.';
        setVoiceInputStatus(errorText);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        setVoiceInputStatus((currentStatus) => (
          currentStatus === 'Listening...' ? 'Voice input ended. Tap Talk to try again.' : currentStatus
        ));
      };

      recognition.start();
    };

    return (
      <section className="flight-attendant-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Flight Attendant</h2>
            <p className="section-hint">Read-only voice briefing for the status board</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="flight-attendant-speak"
              onClick={startVoiceInput}
              disabled={isListening || isGeneratingPremiumVoice}
            >
              {isListening ? 'Listening...' : 'Talk'}
            </button>
            <button
              className="flight-attendant-speak"
              onClick={speakBriefing}
              disabled={isGeneratingPremiumVoice || isListening}
            >
              {isGeneratingPremiumVoice ? 'Generating...' : 'Speak Briefing'}
            </button>
          </div>
        </div>

        <div className="flight-attendant-card">
          <p className="flight-attendant-script">{briefing}</p>
          <p className="flight-attendant-voice-status">{voiceInputStatus}</p>
          {recognizedCommand && (
            <p className="flight-attendant-voice-status">Heard: “{recognizedCommand}”</p>
          )}
          <p className="flight-attendant-voice-status">{voiceStatus}</p>
        </div>

        <div className="flight-attendant-controls">
          <button
            className={`flight-attendant-toggle ${briefingMode === 'short' ? 'active' : ''}`}
            onClick={() => handleModeChange('short')}
          >
            Short
          </button>
          <button
            className={`flight-attendant-toggle ${briefingMode === 'standard' ? 'active' : ''}`}
            onClick={() => handleModeChange('standard')}
          >
            Standard
          </button>
          <button className="flight-attendant-stop" onClick={stopSpeaking}>
            Stop Speaking
          </button>
        </div>

        <p className="flight-attendant-voice-status">
          Try: “active deals”, “deal flow”, “today's snapshot”, “what needs attention”, or “stop speaking”.
        </p>

        <div className="flight-attendant-actions">
          <button
            className={`flight-attendant-button ${activeBriefing === 'activeDeals' ? 'active' : ''}`}
            onClick={() => handleBriefing('activeDeals')}
          >
            Active Deal Summary
          </button>
          <button
            className={`flight-attendant-button ${activeBriefing === 'dealFlow' ? 'active' : ''}`}
            onClick={() => handleBriefing('dealFlow')}
          >
            Deal Flow Summary
          </button>
          <button
            className={`flight-attendant-button ${activeBriefing === 'snapshot' ? 'active' : ''}`}
            onClick={() => handleBriefing('snapshot')}
          >
            Today's Snapshot
          </button>
          <button
            className={`flight-attendant-button ${activeBriefing === 'attention' ? 'active' : ''}`}
            onClick={() => handleBriefing('attention')}
          >
            What Needs Attention?
          </button>
        </div>
      </section>
    );
  };

  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {
    const [selectedDeal, setSelectedDeal] = useState(null);

    const handleDealClick = (deal) => {
      setSelectedDeal(deal);
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

        {selectedDeal && (
          <div className="deal-card" style={{ borderColor: '#38bdf8', marginBottom: '1rem' }}>
            <div className="deal-header">
              <div className="deal-id">
                {selectedDeal.stockNumber || selectedDeal.id} - {selectedDeal.customer?.name || selectedDeal.customerName || 'Unknown Customer'}
              </div>
              <button
                className="stage-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeal(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="deal-vehicle">
              {(selectedDeal.vehicle?.year || selectedDeal.vehicleYear || '')} {(selectedDeal.vehicle?.make || selectedDeal.vehicleMake || '')} {(selectedDeal.vehicle?.model || selectedDeal.vehicleModel || '')}
            </div>

            <div className="deal-footer">
              <span>Stage: {normalizeStage(selectedDeal.status || selectedDeal.stage)}</span>
              <span>Time: {selectedDeal.timeInStage || `${calculateDealAge(selectedDeal.createdAt)} hrs`}</span>
            </div>

            <div className="deal-footer">
              <span>Sales: {selectedDeal.salesperson || selectedDeal.salesRep || 'Unassigned'}</span>
              <span>Urgency: {selectedDeal.urgency || 'normal'}</span>
            </div>

            <div className="deal-footer">
              <span>Gross: {selectedDeal.grossProfit ? `$${selectedDeal.grossProfit.toLocaleString()}` : 'N/A'}</span>
              <span>Payment: {selectedDeal.monthlyPayment ? `$${selectedDeal.monthlyPayment}/mo` : 'N/A'}</span>
            </div>

            <div className="deal-footer">
              <span>Next: {selectedDeal.nextAction || 'Follow up'}</span>
              <span>{selectedDeal.probability ? `${selectedDeal.probability}% close` : ''}</span>
            </div>
          </div>
        )}

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
              onClick={() => handleDealClick(deal)}
            >
              <div className="deal-header">
                <div className="deal-id">
                  {deal.stockNumber || deal.id} - {deal.customer?.name || deal.customerName || 'Unknown Customer'}
                </div>
                <div className="deal-stage">{normalizeStage(deal.status || deal.stage)}</div>
              </div>
              <div className="deal-vehicle">
                {deal.vehicle?.year || deal.vehicleYear} {deal.vehicle?.make || deal.vehicleMake} {deal.vehicle?.model || deal.vehicleModel}
              </div>
              <div className="deal-footer">
                <span>Sales: {deal.salesperson || deal.salesRep || 'Unassigned'}</span>
                <span>Stage Time: {deal.timeInStage || `${calculateDealAge(deal.createdAt)} hrs`}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  };

  const DealFlowTotalsSection = ({ countsByStage, onStageSelect }) => {
    return (
      <section className="totals-section">
        <h2 className="section-title">Deal flow pipeline</h2>
        <div className="totals-grid">
          {dealStages.map((stage) => (
            <button
              key={stage}
              className="total-card"
              onClick={() => onStageSelect(stage)}
            >
              <div className="total-label">{stage}</div>
              <div className="total-count">{countsByStage[stage] || 0}</div>
            </button>
          ))}
        </div>
      </section>
    );
  };

  const TodaySnapshotSection = ({ deals }) => {
    const metrics = {
      totalDeals: deals.length,
      closedDeals: deals.filter(d => (d.probability || 0) >= 90).length,
      revenue: deals.reduce((sum, d) => sum + (d.grossProfit || d.salePrice || 0), 0),
      appointments: deals.filter(d => normalizeStage(d.status || d.stage) === 'Test Drive' || d.appointmentTime).length
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
      const staff = deal.salesperson || deal.salesRep || 'Unassigned';
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
