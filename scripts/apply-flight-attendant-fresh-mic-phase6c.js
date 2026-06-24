#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');

if (!fs.existsSync(mobilePath)) {
  console.error(`Missing ${mobilePath}`);
  process.exit(1);
}

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: ${label}`);
    process.exit(1);
  }
  return source.replace(from, to);
};

let source = fs.readFileSync(mobilePath, 'utf8');
const original = source;

source = replaceOnce(
  source,
  'cleanup media stream on stopMediaTurn',
  `      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      setIsListening(false);`,
  `      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      mediaRecorderRef.current = null;

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      setIsListening(false);`
);

source = replaceOnce(
  source,
  'fresh stream per turn start',
  `      const stream = mediaStreamRef.current;
      if (!stream || !stream.active) {
        setVoiceInputStatus('Microphone session ended. Tap Talk to restart.');
        conversationActiveRef.current = false;
        setConversationActive(false);
        return;
      }

      if (typeof MediaRecorder === 'undefined') {`,
  `      if (typeof MediaRecorder === 'undefined') {`
);

source = replaceOnce(
  source,
  'create recorder fresh stream',
  `      const mimeType = chooseFlightAttendantAudioMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;
      const audioChunks = [];

      let recorder;
      try {
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch (error) {
        console.error('Flight Attendant MediaRecorder failed:', error);
        setVoiceInputStatus('Could not open microphone recorder. Tap Talk to restart.');
        conversationActiveRef.current = false;
        setConversationActive(false);
        return;
      }`,
  `      const mimeType = chooseFlightAttendantAudioMimeType();
      const recorderOptions = mimeType ? { mimeType } : undefined;
      const audioChunks = [];

      let stream;
      let recorder;
      try {
        setVoiceInputStatus('Opening fresh microphone for this turn...');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch (error) {
        console.error('Flight Attendant fresh microphone turn failed:', error);
        setVoiceInputStatus('Could not open microphone for this turn. Tap Talk to restart.');
        conversationActiveRef.current = false;
        setConversationActive(false);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        mediaStreamRef.current = null;
        return;
      }`
);

source = replaceOnce(
  source,
  'onstop cleanup fresh tracks',
  `        setIsListening(false);
        mediaRecorderRef.current = null;

        if (!conversationActiveRef.current) return;`,
  `        setIsListening(false);
        mediaRecorderRef.current = null;

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (!conversationActiveRef.current) return;`
);

source = replaceOnce(
  source,
  'startListening function async',
  `    function startListeningForCommand() {`,
  `    async function startListeningForCommand() {`
);

source = replaceOnce(
  source,
  'start conversation initial mic request',
  `      try {
        setVoiceInputStatus('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        primeFlightAttendantAudio({ onStatus: setVoiceStatus });
        conversationActiveRef.current = true;
        setConversationActive(true);
        setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
        startListeningForCommand();
      } catch (error) {`,
  `      try {
        setVoiceInputStatus('Requesting microphone access...');
        const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissionStream.getTracks().forEach((track) => track.stop());
        primeFlightAttendantAudio({ onStatus: setVoiceStatus });
        conversationActiveRef.current = true;
        setConversationActive(true);
        setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
        startListeningForCommand();
      } catch (error) {`
);

if (source === original) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, source);
console.log('Applied Flight Attendant Phase 6C fresh mic turn patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
