#!/usr/bin/env node
/**
 * FlightLine Phase 5D patch
 * Stabilizes the listen -> answer -> listen again loop on iOS Safari.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-listening-loop-phase5d.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  return source.replace(from, to);
};

let source = fs.readFileSync(mobilePath, 'utf8');
const original = source;

source = replaceOnce(
  source,
  'restart listening delay and status',
  `      restartListeningTimerRef.current = setTimeout(() => {
        restartListeningTimerRef.current = null;
        startListeningForCommand();
      }, 400);`,
  `      setVoiceInputStatus('Response complete. Returning to listening...');

      restartListeningTimerRef.current = setTimeout(() => {
        restartListeningTimerRef.current = null;
        startListeningForCommand();
      }, 1200);`
);

source = replaceOnce(
  source,
  'fresh recognition cleanup before start',
  `      stopPremiumFlightAttendantAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const recognition = new SpeechRecognition();`,
  `      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      stopPremiumFlightAttendantAudio();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceInputStatus('Preparing microphone...');

      const recognition = new SpeechRecognition();`
);

source = replaceOnce(
  source,
  'listening initial status and recognition lifecycle',
  `      recognitionRef.current = recognition;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Conversation active. Listening for FlightLine questions...');

      recognition.onresult = (event) => {`,
  `      recognitionRef.current = recognition;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Preparing microphone...');

      recognition.onstart = () => {
        if (!conversationActiveRef.current) return;
        setVoiceInputStatus('Listening now. Ask a FlightLine question.');
      };

      recognition.onspeechstart = () => {
        if (!conversationActiveRef.current) return;
        setVoiceInputStatus('Heard speech. Keep going...');
      };

      recognition.onspeechend = () => {
        if (!conversationActiveRef.current) return;
        setVoiceInputStatus('Processing FlightLine request...');
      };

      recognition.onresult = (event) => {`
);

source = replaceOnce(
  source,
  'no speech recovery wording',
  `        if (errorName === 'no-speech') {
          setVoiceInputStatus('Still listening. Ask a FlightLine question.');
          scheduleNextListening();
          return;
        }`,
  `        if (errorName === 'no-speech') {
          setVoiceInputStatus('I did not catch that. Still listening for a FlightLine question.');
          scheduleNextListening();
          return;
        }`
);

source = replaceOnce(
  source,
  'recognition onend recovery wording',
  `        if (conversationActiveRef.current && !handledResult) {
          setVoiceInputStatus('Still listening. Ask a FlightLine question.');
          scheduleNextListening();
        }`,
  `        if (conversationActiveRef.current && !handledResult) {
          setVoiceInputStatus('Listening paused. Reopening microphone...');
          scheduleNextListening();
        }`
);

if (source === original) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, source);
console.log('Applied Flight Attendant Phase 5D listening loop patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
