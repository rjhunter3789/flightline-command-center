#!/usr/bin/env node
/**
 * FlightLine Phase 5C patch
 * Primes a reusable premium audio element from the Talk tap so iOS Safari can play
 * generated Flight Attendant responses after speech recognition finishes.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-ios-audio-unlock-phase5c.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');
const audioPath = path.join(repoRoot, 'frontend/src/utils/flightAttendantAudio.js');

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

if (!fs.existsSync(audioPath)) {
  console.error(`flightAttendantAudio.js not found at ${audioPath}`);
  process.exit(1);
}

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  return source.replace(from, to);
};

let mobileSource = fs.readFileSync(mobilePath, 'utf8');
let audioSource = fs.readFileSync(audioPath, 'utf8');
const originalMobile = mobileSource;
const originalAudio = audioSource;

mobileSource = replaceOnce(
  mobileSource,
  'audio import includes prime helper',
  "import { playPremiumFlightAttendantBriefing, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';",
  "import { playPremiumFlightAttendantBriefing, primeFlightAttendantAudio, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';"
);

mobileSource = replaceOnce(
  mobileSource,
  'prime audio on conversation start',
  `      conversationActiveRef.current = true;
      setConversationActive(true);
      setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
      startListeningForCommand();`,
  `      primeFlightAttendantAudio({ onStatus: setVoiceStatus });
      conversationActiveRef.current = true;
      setConversationActive(true);
      setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
      startListeningForCommand();`
);

const audioReplacement = `let activePremiumAudio = null;
let activePremiumAudioUrl = null;
let primedPremiumAudio = null;

const SILENT_AUDIO_DATA_URL = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQQAAAAAAA==';

const getReusablePremiumAudio = () => {
  if (primedPremiumAudio) return primedPremiumAudio;

  primedPremiumAudio = new Audio();
  primedPremiumAudio.preload = 'auto';
  primedPremiumAudio.playsInline = true;
  return primedPremiumAudio;
};

export const primeFlightAttendantAudio = async ({ onStatus } = {}) => {
  const setStatus = typeof onStatus === 'function' ? onStatus : () => {};

  try {
    const audio = getReusablePremiumAudio();
    audio.muted = true;
    audio.src = SILENT_AUDIO_DATA_URL;
    audio.currentTime = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    setStatus('Premium voice audio ready');
    return true;
  } catch (error) {
    console.warn('Flight Attendant audio prime failed:', error);
    setStatus('Premium voice will start after browser allows audio');
    return false;
  }
};

export const stopPremiumFlightAttendantAudio = () => {
  if (activePremiumAudio) {
    activePremiumAudio.pause();
    activePremiumAudio.currentTime = 0;
  }

  activePremiumAudio = null;

  if (activePremiumAudioUrl) {
    URL.revokeObjectURL(activePremiumAudioUrl);
    activePremiumAudioUrl = null;
  }
};

export const playPremiumFlightAttendantBriefing = async ({
  briefingType = 'activeDeals',
  mode = 'short',
  text,
  onStatus,
  onPreparing,
  onFallback,
  onEnded
}) => {
  stopPremiumFlightAttendantAudio();

  const setStatus = typeof onStatus === 'function' ? onStatus : () => {};
  const setPreparing = typeof onPreparing === 'function' ? onPreparing : () => {};
  const fallback = typeof onFallback === 'function' ? onFallback : () => {};
  const ended = typeof onEnded === 'function' ? onEnded : () => {};

  if (!text) {
    setPreparing(false);
    setStatus('No briefing available to speak.');
    return false;
  }

  setPreparing(true);
  setStatus('Generating premium voice...');

  try {
    const response = await fetch('/api/flight-attendant/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        briefingType,
        mode,
        text
      })
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok || !contentType.includes('audio/')) {
      setPreparing(false);
      setStatus('Premium voice unavailable. Tap Speak Briefing or try again.');
      fallback();
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = getReusablePremiumAudio();

    activePremiumAudio = audio;
    activePremiumAudioUrl = audioUrl;

    audio.onended = () => {
      stopPremiumFlightAttendantAudio();
      setStatus('Premium voice ready');
      ended();
    };

    audio.onerror = () => {
      stopPremiumFlightAttendantAudio();
      setPreparing(false);
      setStatus('Premium voice playback failed. Tap Speak Briefing or try again.');
      fallback();
    };

    audio.muted = false;
    audio.src = audioUrl;
    audio.currentTime = 0;
    audio.load();

    setStatus('Speaking with premium voice');
    setPreparing(false);
    await audio.play();
    return true;
  } catch (error) {
    console.error('Premium voice error:', error);
    stopPremiumFlightAttendantAudio();
    setPreparing(false);
    setStatus('Premium voice blocked by browser. Tap Speak Briefing or try again.');
    fallback();
    return false;
  }
};
`;

audioSource = audioReplacement;

if (mobileSource === originalMobile && audioSource === originalAudio) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, mobileSource);
fs.writeFileSync(audioPath, audioSource);
console.log('Applied Flight Attendant Phase 5C iOS audio unlock patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
console.log(`Updated ${path.relative(repoRoot, audioPath)}`);
