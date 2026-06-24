#!/usr/bin/env node
/**
 * FlightLine Phase 5B patch
 * Converts Flight Attendant Mobile from one-shot command mode to scoped conversational session mode.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-conversation-phase5b.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');
const audioPath = path.join(repoRoot, 'frontend/src/utils/flightAttendantAudio.js');

const block = (fn) => {
  const text = fn.toString();
  return text.slice(text.indexOf('/*') + 2, text.lastIndexOf('*/'));
};

const replaceRange = (source, label, startNeedle, endNeedle, replacement) => {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);

  if (start === -1 || end === -1 || end <= start) {
    console.error(`Patch failed: could not find range for ${label}.`);
    process.exit(1);
  }

  return source.slice(0, start) + replacement + source.slice(end);
};

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  return source.replace(from, to);
};

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

if (!fs.existsSync(audioPath)) {
  console.error(`flightAttendantAudio.js not found at ${audioPath}`);
  process.exit(1);
}

let mobileSource = fs.readFileSync(mobilePath, 'utf8');
let audioSource = fs.readFileSync(audioPath, 'utf8');
const originalMobile = mobileSource;
const originalAudio = audioSource;

if (!mobileSource.includes("import React, { useState, useEffect, useRef } from 'react';")) {
  mobileSource = replaceOnce(
    mobileSource,
    'React import useRef',
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
  );
}

const commandHelpers = block(function () {/*  const getSpeechRecognitionApi = () => {
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

    const offTopicTerms = [
      'weather',
      'temperature',
      'forecast',
      'mariners',
      'seahawks',
      'kraken',
      'sounders',
      'score',
      'game',
      'news',
      'stock market',
      'traffic',
      'restaurant',
      'joke'
    ];

    if (command.includes('stop listening') || command.includes('end conversation') || command.includes('cancel conversation') || command.includes('stop speaking') || command.includes('stop playback') || command === 'stop') {
      return { action: 'stop', label: 'Stop Listening' };
    }

    if (command.includes('repeat that') || command.includes('say that again') || command.includes('repeat briefing') || command === 'repeat') {
      return { action: 'repeat', label: 'Repeat' };
    }

    if (command.includes('shorter') || command.includes('short version') || command.includes('brief version') || command.includes('keep it short')) {
      return { action: 'mode', mode: 'short', label: 'Short Version' };
    }

    if (command.includes('more detail') || command.includes('standard version') || command.includes('longer') || command.includes('expand on that')) {
      return { action: 'mode', mode: 'standard', label: 'More Detail' };
    }

    if (command.includes('active deal summary') || command.includes('active deals') || command.includes('active deal') || command.includes('deals on the board') || command.includes('what deals are active')) {
      return { action: 'briefing', briefingType: 'activeDeals', label: 'Active Deal Summary' };
    }

    if (command.includes('deal flow') || command.includes('pipeline') || command.includes('flow look') || command.includes('how is flow') || command.includes('how are deals moving')) {
      return { action: 'briefing', briefingType: 'dealFlow', label: 'Deal Flow Summary' };
    }

    if (command.includes("today's snapshot") || command.includes('todays snapshot') || command.includes('snapshot') || command.includes('what is going on today') || command.includes("what's going on today") || command.includes('today look like')) {
      return { action: 'briefing', briefingType: 'snapshot', label: "Today's Snapshot" };
    }

    if (command.includes('what needs attention') || command.includes('needs attention') || command.includes('attention') || command.includes('what should i look at first') || command.includes('anything need') || command.includes('manager look')) {
      return { action: 'briefing', briefingType: 'attention', label: 'What Needs Attention' };
    }

    if (offTopicTerms.some((term) => command.includes(term))) {
      return { action: 'offTopic', label: 'Out of Scope' };
    }

    return { action: 'unknown', label: 'Unknown FlightLine Request' };
  };

*/});

mobileSource = replaceRange(
  mobileSource,
  'Flight Attendant command helpers',
  '  const getSpeechRecognitionApi = () => {',
  "  const buildFlightAttendantBriefing = (type, deals, countsByStage, mode = 'standard') => {",
  commandHelpers
);

const flightAttendantSection = block(function () {/*  const FlightAttendantSection = ({ deals, countsByStage }) => {
    const [briefing, setBriefing] = useState('Flight Attendant is ready. Tap Talk to start a FlightLine conversation.');
    const [activeBriefing, setActiveBriefing] = useState(null);
    const [briefingMode, setBriefingMode] = useState('short');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
    const [voiceInputStatus, setVoiceInputStatus] = useState('Tap Talk once. Ask about FlightLine deal activity only.');
    const [recognizedCommand, setRecognizedCommand] = useState('');
    const [isGeneratingPremiumVoice, setIsGeneratingPremiumVoice] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [conversationActive, setConversationActive] = useState(false);
    const recognitionRef = useRef(null);
    const conversationActiveRef = useRef(false);
    const restartListeningTimerRef = useRef(null);
    const lastSpokenBriefingRef = useRef('Flight Attendant is ready. Tap Talk to start a FlightLine conversation.');

    useEffect(() => {
      return () => {
        conversationActiveRef.current = false;
        if (restartListeningTimerRef.current) {
          clearTimeout(restartListeningTimerRef.current);
          restartListeningTimerRef.current = null;
        }
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
      lastSpokenBriefingRef.current = nextBriefing;
      return nextBriefing;
    };

    const handleModeChange = (mode) => {
      setBriefingMode(mode);
      if (activeBriefing) {
        handleBriefing(activeBriefing, mode);
      }
    };

    const stopVoiceRecognition = () => {
      if (restartListeningTimerRef.current) {
        clearTimeout(restartListeningTimerRef.current);
        restartListeningTimerRef.current = null;
      }

      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      setIsListening(false);
    };

    const stopConversationSession = () => {
      conversationActiveRef.current = false;
      setConversationActive(false);
      stopVoiceRecognition();
      stopPremiumFlightAttendantAudio();
      setIsGeneratingPremiumVoice(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceInputStatus('Conversation stopped. Tap Talk to start again.');
      setVoiceStatus('Speech stopped');
    };

    const stopSpeaking = () => {
      stopConversationSession();
    };

    const scheduleNextListening = () => {
      if (!conversationActiveRef.current) return;

      if (restartListeningTimerRef.current) {
        clearTimeout(restartListeningTimerRef.current);
      }

      restartListeningTimerRef.current = setTimeout(() => {
        restartListeningTimerRef.current = null;
        startListeningForCommand();
      }, 400);
    };

    const speakWithNativeBrowserVoice = (textToSpeak = briefing, onFinished = null) => {
      if (!('speechSynthesis' in window)) {
        setBriefing(`${textToSpeak} Voice readout is not supported in this browser.`);
        if (typeof onFinished === 'function') onFinished();
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
      utterance.onend = () => {
        setVoiceStatus(preferredVoice ? `Voice: ${preferredVoice.name}` : 'Native browser voice');
        if (typeof onFinished === 'function') onFinished();
      };
      utterance.onerror = () => {
        setVoiceStatus('Voice readout stopped or unavailable');
        if (typeof onFinished === 'function') onFinished();
      };
      window.speechSynthesis.speak(utterance);
    };

    const speakBriefingText = async (type = activeBriefing || 'activeDeals', mode = briefingMode, textToSpeak = briefing, onFinished = null) => {
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
        onFallback: () => speakWithNativeBrowserVoice(textToSpeak, onFinished),
        onEnded: onFinished
      });
    };

    const speakBriefing = async () => {
      await speakBriefingText(activeBriefing || 'activeDeals', briefingMode, briefing);
    };

    const getScopedResponse = () => {
      return 'Flight Attendant is scoped to FlightLine deal activity. Ask me about deal flow, active deals, today’s snapshot, or what needs attention.';
    };

    const getUnknownResponse = () => {
      return 'I can help with FlightLine deal activity. Try asking for deal flow, active deals, today’s snapshot, or what needs attention.';
    };

    const runVoiceCommand = async (spokenText) => {
      const mappedCommand = mapFlightAttendantVoiceCommand(spokenText);

      if (!mappedCommand) {
        const responseText = getUnknownResponse();
        setBriefing(responseText);
        setVoiceInputStatus('FlightLine request not recognized.');
        lastSpokenBriefingRef.current = responseText;
        await speakBriefingText(activeBriefing || 'activeDeals', briefingMode, responseText, scheduleNextListening);
        return;
      }

      if (mappedCommand.action === 'stop') {
        stopConversationSession();
        return;
      }

      if (mappedCommand.action === 'offTopic') {
        const responseText = getScopedResponse();
        setBriefing(responseText);
        setVoiceInputStatus('Out of scope. FlightLine only.');
        lastSpokenBriefingRef.current = responseText;
        await speakBriefingText(activeBriefing || 'activeDeals', 'short', responseText, scheduleNextListening);
        return;
      }

      if (mappedCommand.action === 'unknown') {
        const responseText = getUnknownResponse();
        setBriefing(responseText);
        setVoiceInputStatus('FlightLine request not recognized.');
        lastSpokenBriefingRef.current = responseText;
        await speakBriefingText(activeBriefing || 'activeDeals', 'short', responseText, scheduleNextListening);
        return;
      }

      if (mappedCommand.action === 'repeat') {
        const responseText = lastSpokenBriefingRef.current || briefing;
        setVoiceInputStatus('Repeating last FlightLine response.');
        await speakBriefingText(activeBriefing || 'activeDeals', briefingMode, responseText, scheduleNextListening);
        return;
      }

      if (mappedCommand.action === 'mode') {
        const nextMode = mappedCommand.mode;
        const nextType = activeBriefing || 'activeDeals';
        setBriefingMode(nextMode);
        const responseText = buildFlightAttendantBriefing(nextType, deals, countsByStage, nextMode);
        setBriefing(responseText);
        lastSpokenBriefingRef.current = responseText;
        setVoiceInputStatus(`Heard: ${mappedCommand.label}.`);
        await speakBriefingText(nextType, nextMode, responseText, scheduleNextListening);
        return;
      }

      if (mappedCommand.action === 'briefing') {
        const responseText = handleBriefing(mappedCommand.briefingType, briefingMode);
        setVoiceInputStatus(`Heard: ${mappedCommand.label}.`);
        await speakBriefingText(mappedCommand.briefingType, briefingMode, responseText, scheduleNextListening);
      }
    };

    function startListeningForCommand() {
      if (!conversationActiveRef.current || isListening || isGeneratingPremiumVoice) return;

      const SpeechRecognition = getSpeechRecognitionApi();
      if (!SpeechRecognition) {
        conversationActiveRef.current = false;
        setConversationActive(false);
        setVoiceInputStatus('Voice input is not supported in this browser. Use the briefing buttons or Speak Briefing.');
        return;
      }

      stopPremiumFlightAttendantAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const recognition = new SpeechRecognition();
      let handledResult = false;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Conversation active. Listening for FlightLine questions...');

      recognition.onresult = (event) => {
        handledResult = true;
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
        if (!conversationActiveRef.current) return;

        const errorName = event?.error || 'unknown';
        if (errorName === 'no-speech') {
          setVoiceInputStatus('Still listening. Ask a FlightLine question.');
          scheduleNextListening();
          return;
        }

        setVoiceInputStatus(`Voice input stopped: ${errorName}. Tap Talk to restart.`);
        conversationActiveRef.current = false;
        setConversationActive(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        if (conversationActiveRef.current && !handledResult) {
          setVoiceInputStatus('Still listening. Ask a FlightLine question.');
          scheduleNextListening();
        }
      };

      recognition.start();
    }

    const startConversationSession = () => {
      if (conversationActiveRef.current || isGeneratingPremiumVoice) return;

      const SpeechRecognition = getSpeechRecognitionApi();
      if (!SpeechRecognition) {
        setVoiceInputStatus('Voice input is not supported in this browser. Use the briefing buttons or Speak Briefing.');
        return;
      }

      conversationActiveRef.current = true;
      setConversationActive(true);
      setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
      startListeningForCommand();
    };

    return (
      <section className="flight-attendant-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Flight Attendant</h2>
            <p className="section-hint">Scoped voice conversation for FlightLine deal activity</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="flight-attendant-speak"
              onClick={conversationActive ? stopConversationSession : startConversationSession}
              disabled={isGeneratingPremiumVoice && !conversationActive}
            >
              {conversationActive ? (isListening ? 'Listening...' : 'End') : 'Talk'}
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
            Stop Listening
          </button>
        </div>

        <p className="flight-attendant-voice-status">
          Try: “Can you give me deal flow?”, “How are active deals looking?”, “What needs attention?”, “shorter version”, or “stop listening”.
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

*/});

mobileSource = replaceRange(
  mobileSource,
  'Flight Attendant section',
  '  const FlightAttendantSection = ({ deals, countsByStage }) => {',
  '  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {',
  flightAttendantSection
);

audioSource = replaceOnce(
  audioSource,
  'audio onEnded argument',
  `  onPreparing,
  onFallback
}) => {`,
  `  onPreparing,
  onFallback,
  onEnded
}) => {`
);

audioSource = replaceOnce(
  audioSource,
  'audio ended callback const',
  `  const fallback = typeof onFallback === 'function' ? onFallback : () => {};`,
  `  const fallback = typeof onFallback === 'function' ? onFallback : () => {};
  const ended = typeof onEnded === 'function' ? onEnded : () => {};`
);

audioSource = replaceOnce(
  audioSource,
  'audio onended callback',
  `    audio.onended = () => {
      stopPremiumFlightAttendantAudio();
      setStatus('Premium voice ready');
    };`,
  `    audio.onended = () => {
      stopPremiumFlightAttendantAudio();
      setStatus('Premium voice ready');
      ended();
    };`
);

if (mobileSource === originalMobile && audioSource === originalAudio) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, mobileSource);
fs.writeFileSync(audioPath, audioSource);
console.log('Applied Flight Attendant Phase 5B conversational session patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
console.log(`Updated ${path.relative(repoRoot, audioPath)}`);
