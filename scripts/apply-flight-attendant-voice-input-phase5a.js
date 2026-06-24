#!/usr/bin/env node
/**
 * FlightLine Phase 5A patch
 * Adds constrained browser speech-recognition intake to Flight Attendant Mobile.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-voice-input-phase5a.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

let source = fs.readFileSync(mobilePath, 'utf8');
const original = source;

const replaceOnce = (label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  source = source.replace(from, to);
};

replaceOnce(
  'React import useRef',
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

replaceOnce(
  'voice command helpers',
  `  const buildFlightAttendantBriefing = (type, deals, countsByStage, mode = 'standard') => {`,
  `  const getSpeechRecognitionApi = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const normalizeFlightAttendantCommand = (text = '') => {
    return String(text)
      .toLowerCase()
      .replace(/[^\\w\\s']/g, ' ')
      .replace(/\\s+/g, ' ')
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

  const buildFlightAttendantBriefing = (type, deals, countsByStage, mode = 'standard') => {`
);

replaceOnce(
  'Flight Attendant voice input state',
  `    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
    const [isGeneratingPremiumVoice, setIsGeneratingPremiumVoice] = useState(false);`,
  `    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
    const [voiceInputStatus, setVoiceInputStatus] = useState('Tap Talk to ask for a read-only briefing.');
    const [recognizedCommand, setRecognizedCommand] = useState('');
    const [isGeneratingPremiumVoice, setIsGeneratingPremiumVoice] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);`
);

replaceOnce(
  'voice cleanup effect',
  `    useEffect(() => {
      if (!('speechSynthesis' in window)) return;`,
  `    useEffect(() => {
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
      if (!('speechSynthesis' in window)) return;`
);

replaceOnce(
  'handleBriefing returns next briefing',
  `    const handleBriefing = (type, mode = briefingMode) => {
      setActiveBriefing(type);
      setBriefing(buildFlightAttendantBriefing(type, deals, countsByStage, mode));
    };`,
  `    const handleBriefing = (type, mode = briefingMode) => {
      const nextBriefing = buildFlightAttendantBriefing(type, deals, countsByStage, mode);
      setActiveBriefing(type);
      setBriefing(nextBriefing);
      return nextBriefing;
    };`
);

replaceOnce(
  'stop speaking with recognition cleanup',
  `    const stopSpeaking = () => {
      stopPremiumFlightAttendantAudio();
      setIsGeneratingPremiumVoice(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceStatus('Speech stopped');
    };`,
  `    const stopSpeaking = () => {
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
    };`
);

replaceOnce(
  'native browser speech function accepts text',
  `    const speakWithNativeBrowserVoice = () => {
      if (!('speechSynthesis' in window)) {
        setBriefing(\`\${briefing} Voice readout is not supported in this browser.\`);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(briefing);`,
  `    const speakWithNativeBrowserVoice = (textToSpeak = briefing) => {
      if (!('speechSynthesis' in window)) {
        setBriefing(\`\${textToSpeak} Voice readout is not supported in this browser.\`);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);`
);

replaceOnce(
  'speak briefing with text helper',
  `    const speakBriefing = async () => {
      if (isGeneratingPremiumVoice) return;

      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      await playPremiumFlightAttendantBriefing({
        briefingType: activeBriefing || 'activeDeals',
        mode: briefingMode,
        text: briefing,
        onStatus: setVoiceStatus,
        onPreparing: setIsGeneratingPremiumVoice,
        onFallback: speakWithNativeBrowserVoice
      });
    };`,
  `    const speakBriefingText = async (type = activeBriefing || 'activeDeals', mode = briefingMode, textToSpeak = briefing) => {
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
      setVoiceInputStatus(\`Heard: \${mappedCommand.label}.\`);
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
        const errorText = event?.error ? \`Voice input stopped: \${event.error}.\` : 'Voice input stopped.';
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
    };`
);

replaceOnce(
  'Flight Attendant header buttons',
  `          <button
            className="flight-attendant-speak"
            onClick={speakBriefing}
            disabled={isGeneratingPremiumVoice}
          >
            {isGeneratingPremiumVoice ? 'Generating...' : 'Speak Briefing'}
          </button>`,
  `          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          </div>`
);

replaceOnce(
  'Flight Attendant card voice input status',
  `          <p className="flight-attendant-script">{briefing}</p>
          <p className="flight-attendant-voice-status">{voiceStatus}</p>`,
  `          <p className="flight-attendant-script">{briefing}</p>
          <p className="flight-attendant-voice-status">{voiceInputStatus}</p>
          {recognizedCommand && (
            <p className="flight-attendant-voice-status">Heard: “{recognizedCommand}”</p>
          )}
          <p className="flight-attendant-voice-status">{voiceStatus}</p>`
);

replaceOnce(
  'Flight Attendant command hint',
  `        <div className="flight-attendant-actions">`,
  `        <p className="flight-attendant-voice-status">
          Try: “active deals”, “deal flow”, “today's snapshot”, “what needs attention”, or “stop speaking”.
        </p>

        <div className="flight-attendant-actions">`
);

if (source === original) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, source);
console.log('Applied Flight Attendant Phase 5A voice input patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
