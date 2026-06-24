const logger = require('../utils/logger');

const TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
const DEFAULT_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const MAX_TRANSCRIPTION_BYTES = 8 * 1024 * 1024;

const FLIGHTLINE_PROMPT = [
  'This is audio from FlightLine Flight Attendant, a dealership deal-activity voice assistant.',
  'Expected phrases include deal flow, active deals, today snapshot, todays snapshot, what needs attention, showroom, test drive, negotiation, F and I, F&I, finance office, shorter version, repeat that, stop listening.',
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

  form.append('file', blob, `flight-attendant-turn.${extension}`);
  form.append('model', model);
  form.append('language', 'en');
  form.append('prompt', FLIGHTLINE_PROMPT);

  const response = await fetch(TRANSCRIPTIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`
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
