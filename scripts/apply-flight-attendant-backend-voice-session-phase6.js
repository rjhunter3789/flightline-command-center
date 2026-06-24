#!/usr/bin/env node
/**
 * FlightLine Phase 6 patch
 * Moves Flight Attendant conversational intake from browser SpeechRecognition
 * to a backend-backed voice turn loop using MediaRecorder + OpenAI transcription.
 *
 * Run from repo root:
 *   node scripts/apply-flight-attendant-backend-voice-session-phase6.js
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const mobilePath = path.join(repoRoot, 'frontend/src/components/Mobile/FlightlineMobile.jsx');
const routePath = path.join(repoRoot, 'backend/src/routes/flightAttendantRoutes.js');
const transcriptionServicePath = path.join(repoRoot, 'backend/src/services/openaiTranscriptionProvider.js');

const block = (fn) => {
  const text = fn.toString();
  return text.slice(text.indexOf('/*') + 2, text.lastIndexOf('*/'));
};

const replaceOnce = (source, label, from, to) => {
  if (!source.includes(from)) {
    console.error(`Patch failed: could not find block for ${label}.`);
    process.exit(1);
  }
  return source.replace(from, to);
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

if (!fs.existsSync(mobilePath)) {
  console.error(`FlightlineMobile.jsx not found at ${mobilePath}`);
  process.exit(1);
}

if (!fs.existsSync(routePath)) {
  console.error(`flightAttendantRoutes.js not found at ${routePath}`);
  process.exit(1);
}

let mobileSource = fs.readFileSync(mobilePath, 'utf8');
let routeSource = fs.readFileSync(routePath, 'utf8');
const originalMobile = mobileSource;
const originalRoute = routeSource;

const transcriptionService = `const logger = require('../utils/logger');

const TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
const DEFAULT_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const MAX_TRANSCRIPTION_BYTES = 8 * 1024 * 1024;

const FLIGHTLINE_PROMPT = [
  'This is audio from FlightLine Flight Attendant, a dealership deal-activity voice assistant.',
  'Expected phrases include deal flow, active deals, today snapshot, today\'s snapshot, what needs attention, showroom, test drive, negotiation, F and I, F&I, finance office, shorter version, repeat that, stop listening.',
  'Do not add words that were not spoken.'
].join(' ');

const getApiKey = () => process.env.OPENAI_API_KEY || '';

const isConfigured = () => Boolean(getApiKey());

const getStatus = () => ({
  configured: isConfigured(),
  provider: 'openai',
  model: process.env.OPENAI_STT_MODEL || DEFAULT_TRANSCRIPTION_MODEL,
  maxBytes: MAX_TRANSCRIPTION_BYTES
});

const getFileExtension = (mimeType = '') => {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
};

const transcribeAudio = async ({ audioBuffer, mimeType = 'audio/webm' }) => {
  if (!isConfigured()) {
    const error = new Error('OpenAI transcription provider is not configured.');
    error.code = 'TRANSCRIPTION_PROVIDER_NOT_CONFIGURED';
    throw error;
  }

  if (!Buffer.isBuffer(audioBuffer) || !audioBuffer.length) {
    const error = new Error('Audio buffer is required.');
    error.code = 'TRANSCRIPTION_AUDIO_REQUIRED';
    throw error;
  }

  if (audioBuffer.length > MAX_TRANSCRIPTION_BYTES) {
    const error = new Error('Audio buffer exceeds maximum size.');
    error.code = 'TRANSCRIPTION_AUDIO_TOO_LARGE';
    throw error;
  }

  const model = process.env.OPENAI_STT_MODEL || DEFAULT_TRANSCRIPTION_MODEL;
  const form = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType });
  const extension = getFileExtension(mimeType);

  form.append('file', blob, \`flight-attendant-turn.\${extension}\`);
  form.append('model', model);
  form.append('language', 'en');
  form.append('prompt', FLIGHTLINE_PROMPT);

  const response = await fetch(TRANSCRIPTIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${getApiKey()}\`
    },
    body: form
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    logger.error('Flight Attendant transcription request failed', {
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.slice(0, 500)
    });

    const error = new Error('OpenAI transcription request failed.');
    error.code = 'TRANSCRIPTION_REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = typeof data.text === 'string' ? data.text.trim() : '';

  return {
    text,
    provider: 'openai',
    model,
    mimeType,
    bytes: audioBuffer.length
  };
};

module.exports = {
  getStatus,
  transcribeAudio
};
`;

fs.writeFileSync(transcriptionServicePath, transcriptionService);

routeSource = replaceOnce(
  routeSource,
  'require transcription provider',
  "const openaiVoiceProvider = require('../services/openaiVoiceProvider');",
  "const openaiVoiceProvider = require('../services/openaiVoiceProvider');\nconst openaiTranscriptionProvider = require('../services/openaiTranscriptionProvider');"
);

routeSource = replaceOnce(
  routeSource,
  'add transcription constants',
  `const MAX_TTS_TEXT_LENGTH = 1200;`,
  `const MAX_TTS_TEXT_LENGTH = 1200;
const MAX_TRANSCRIPTION_BYTES = 8 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/octet-stream'
];`
);

routeSource = replaceOnce(
  routeSource,
  'insert conversation transcription routes',
  `router.post('/tts', async (req, res) => {`,
  `router.get('/conversation/status', (req, res) => {
  const status = openaiTranscriptionProvider.getStatus();

  res.status(200).json({
    success: true,
    configured: status.configured,
    provider: status.provider,
    model: status.model,
    maxBytes: status.maxBytes,
    message: status.configured
      ? 'OpenAI transcription is configured for Flight Attendant voice sessions.'
      : 'OpenAI transcription is not configured.'
  });
});

router.post(
  '/conversation/transcribe',
  express.raw({
    type: ALLOWED_AUDIO_TYPES,
    limit: MAX_TRANSCRIPTION_BYTES
  }),
  async (req, res) => {
    const audioBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const mimeType = req.headers['content-type'] || 'application/octet-stream';

    if (!audioBuffer.length) {
      return res.status(400).json({
        success: false,
        error: 'Audio body is required.'
      });
    }

    if (audioBuffer.length > MAX_TRANSCRIPTION_BYTES) {
      return res.status(413).json({
        success: false,
        error: 'Audio body exceeds maximum allowed size.',
        maxBytes: MAX_TRANSCRIPTION_BYTES
      });
    }

    if (!openaiTranscriptionProvider.getStatus().configured) {
      return res.status(503).json({
        success: false,
        configured: false,
        provider: 'openai',
        error: 'Transcription is not configured.'
      });
    }

    try {
      const result = await openaiTranscriptionProvider.transcribeAudio({
        audioBuffer,
        mimeType
      });

      logger.info('Flight Attendant voice turn transcribed', {
        textLength: result.text.length,
        bytes: result.bytes,
        mimeType: result.mimeType,
        provider: result.provider,
        model: result.model
      });

      return res.status(200).json({
        success: true,
        transcript: result.text,
        provider: result.provider,
        model: result.model
      });
    } catch (error) {
      logger.error('Flight Attendant voice turn transcription failed', {
        message: error.message,
        code: error.code,
        status: error.status,
        bytes: audioBuffer.length,
        mimeType
      });

      return res.status(502).json({
        success: false,
        configured: true,
        provider: 'openai',
        error: 'Voice turn transcription failed.'
      });
    }
  }
);

router.post('/tts', async (req, res) => {`
);

const mediaRecorderHelper = block(function () {/*  const chooseFlightAttendantAudioMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';

    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ];

    return preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const transcribeFlightAttendantAudioTurn = async (audioBlob) => {
    const response = await fetch('/api/flight-attendant/conversation/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': audioBlob.type || 'application/octet-stream'
      },
      body: audioBlob
    });

    if (!response.ok) {
      throw new Error('Flight Attendant transcription request failed.');
    }

    const result = await response.json();
    return typeof result.transcript === 'string' ? result.transcript.trim() : '';
  };

*/});

mobileSource = replaceOnce(
  mobileSource,
  'insert media recorder helpers',
  `  const getSpeechRecognitionApi = () => {`,
  `${mediaRecorderHelper}  const getSpeechRecognitionApi = () => {`
);

const phase6Section = block(function () {/*  const FlightAttendantSection = ({ deals, countsByStage }) => {
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
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordingTimerRef = useRef(null);
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
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
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

    const stopMediaTurn = () => {
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      setIsListening(false);
    };

    const stopConversationSession = () => {
      conversationActiveRef.current = false;
      setConversationActive(false);
      stopMediaTurn();
      mediaRecorderRef.current = null;

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

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

      setVoiceInputStatus('Response complete. Opening microphone for the next FlightLine question...');

      restartListeningTimerRef.current = setTimeout(() => {
        restartListeningTimerRef.current = null;
        startListeningForCommand();
      }, 900);
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

      const stream = mediaStreamRef.current;
      if (!stream || !stream.active) {
        setVoiceInputStatus('Microphone session ended. Tap Talk to restart.');
        conversationActiveRef.current = false;
        setConversationActive(false);
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        setVoiceInputStatus('Voice session recording is not supported in this browser.');
        conversationActiveRef.current = false;
        setConversationActive(false);
        return;
      }

      const mimeType = chooseFlightAttendantAudioMimeType();
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
      }

      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setRecognizedCommand('');
      setVoiceInputStatus('Listening now. Ask a FlightLine question.');

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsListening(false);
        setVoiceInputStatus('Microphone recorder stopped. Tap Talk to restart.');
        conversationActiveRef.current = false;
        setConversationActive(false);
      };

      recorder.onstop = async () => {
        setIsListening(false);
        mediaRecorderRef.current = null;

        if (!conversationActiveRef.current) return;

        if (!audioChunks.length) {
          setVoiceInputStatus('I did not catch that. Listening again...');
          scheduleNextListening();
          return;
        }

        try {
          setVoiceInputStatus('Processing FlightLine request...');
          const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
          const transcript = await transcribeFlightAttendantAudioTurn(audioBlob);

          if (!conversationActiveRef.current) return;

          if (!transcript) {
            setVoiceInputStatus('I did not catch that. Listening again...');
            scheduleNextListening();
            return;
          }

          setRecognizedCommand(transcript);
          setVoiceInputStatus(`Heard: ${transcript}`);
          await runVoiceCommand(transcript);
        } catch (error) {
          console.error('Flight Attendant turn transcription failed:', error);
          if (!conversationActiveRef.current) return;
          setVoiceInputStatus('I could not process that voice turn. Listening again...');
          scheduleNextListening();
        }
      };

      recorder.start();
      recordingTimerRef.current = setTimeout(() => {
        recordingTimerRef.current = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5500);
    }

    const startConversationSession = async () => {
      if (conversationActiveRef.current || isGeneratingPremiumVoice) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVoiceInputStatus('Microphone access is not supported in this browser.');
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        setVoiceInputStatus('Voice session recording is not supported in this browser.');
        return;
      }

      try {
        setVoiceInputStatus('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        primeFlightAttendantAudio({ onStatus: setVoiceStatus });
        conversationActiveRef.current = true;
        setConversationActive(true);
        setVoiceInputStatus('Conversation active. Ask about FlightLine deal activity only.');
        startListeningForCommand();
      } catch (error) {
        console.error('Flight Attendant microphone access failed:', error);
        setVoiceInputStatus('Microphone access was not allowed. Tap Talk and allow microphone access.');
      }
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
  'Flight Attendant section Phase 6',
  '  const FlightAttendantSection = ({ deals, countsByStage }) => {',
  '  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {',
  phase6Section
);

fs.writeFileSync(mobilePath, mobileSource);
fs.writeFileSync(routePath, routeSource);

console.log('Applied Flight Attendant Phase 6 backend voice session patch.');
console.log(`Updated ${path.relative(repoRoot, mobilePath)}`);
console.log(`Updated ${path.relative(repoRoot, routePath)}`);
console.log(`Created ${path.relative(repoRoot, transcriptionServicePath)}`);
