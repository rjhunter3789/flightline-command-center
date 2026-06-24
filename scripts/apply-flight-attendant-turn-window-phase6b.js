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
  'remove unused helper',
  `  const getSpeechRecognitionApi = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

`,
  ''
);

source = replaceOnce(
  source,
  'initial listen status',
  `      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Listening now. Ask a FlightLine question.');`,
  `      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Opening voice turn...');`
);

source = replaceOnce(
  source,
  'data available handler',
  `      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };`,
  `      recorder.onstart = () => {
        if (!conversationActiveRef.current) return;
        setVoiceInputStatus('Speak now. Recording this FlightLine question for 5 seconds...');
      };

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
          setVoiceInputStatus('Voice captured. Preparing FlightLine request...');
        }
      };`
);

source = replaceOnce(
  source,
  'processing status',
  `        try {
          setVoiceInputStatus('Processing FlightLine request...');
          const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
          const transcript = await transcribeFlightAttendantAudioTurn(audioBlob);`,
  `        try {
          setVoiceInputStatus('Sending voice turn to Flight Attendant...');
          const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
          setVoiceInputStatus(\`Processing FlightLine request... audio bytes: \${audioBlob.size}.\`);
          const transcript = await transcribeFlightAttendantAudioTurn(audioBlob);`
);

source = replaceOnce(
  source,
  'empty transcript status',
  `          if (!transcript) {
            setVoiceInputStatus('I did not catch that. Listening again...');
            scheduleNextListening();
            return;
          }`,
  `          if (!transcript) {
            setVoiceInputStatus('No transcript returned. I did not catch that voice turn. Listening again...');
            scheduleNextListening();
            return;
          }`
);

source = replaceOnce(
  source,
  'forced recorder stop',
  `      recorder.start();
      recordingTimerRef.current = setTimeout(() => {
        recordingTimerRef.current = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5500);`,
  `      recorder.start();
      recordingTimerRef.current = setTimeout(() => {
        recordingTimerRef.current = null;
        const activeRecorder = mediaRecorderRef.current;
        if (!activeRecorder || activeRecorder.state !== 'recording') return;
        setVoiceInputStatus('Recording complete. Finalizing voice turn...');
        try {
          activeRecorder.requestData();
        } catch (error) {
          console.warn('Flight Attendant requestData failed:', error);
        }
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            setVoiceInputStatus('Sending voice turn...');
            mediaRecorderRef.current.stop();
          }
        }, 250);
      }, 5000);`
);

source = replaceOnce(
  source,
  'restart prompt',
  `      setVoiceInputStatus('Response complete. Opening microphone for the next FlightLine question...');`,
  `      setVoiceInputStatus('Response complete. Next voice turn starts in 1 second.');`
);

if (source === original) {
  console.error('Patch made no changes.');
  process.exit(1);
}

fs.writeFileSync(mobilePath, source);
console.log('Applied Flight Attendant Phase 6B voice turn window patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
