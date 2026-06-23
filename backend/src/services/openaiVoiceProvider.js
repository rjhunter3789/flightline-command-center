const axios = require('axios');

const SPEECH_URL = 'https://api.openai.com/v1/audio/speech';
const DEFAULT_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_VOICE = 'nova';
const DEFAULT_FORMAT = 'mp3';
const DEFAULT_SPEED = 0.95;

const VOICE_INSTRUCTIONS = [
  'Speak like a calm, professional dealership operations assistant.',
  'Keep the delivery clear, concise, and steady.',
  'Do not sound theatrical or overly excited.'
].join(' ');

const getApiKey = () => process.env.OPENAI_API_KEY || '';

const isConfigured = () => Boolean(getApiKey());

const getStatus = () => ({
  configured: isConfigured(),
  provider: 'openai',
  model: process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL,
  voice: process.env.OPENAI_TTS_VOICE || DEFAULT_VOICE,
  responseFormat: process.env.OPENAI_TTS_FORMAT || DEFAULT_FORMAT
});

const buildAuthHeader = () => ['Bearer', getApiKey()].join(' ');

const generateSpeech = async ({ text, mode = 'short' }) => {
  if (!isConfigured()) {
    const error = new Error('OpenAI voice provider is not configured.');
    error.code = 'VOICE_PROVIDER_NOT_CONFIGURED';
    throw error;
  }

  const model = process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL;
  const voice = process.env.OPENAI_TTS_VOICE || DEFAULT_VOICE;
  const responseFormat = process.env.OPENAI_TTS_FORMAT || DEFAULT_FORMAT;
  const parsedSpeed = Number(process.env.OPENAI_TTS_SPEED || DEFAULT_SPEED);
  const speed = Number.isFinite(parsedSpeed) ? parsedSpeed : DEFAULT_SPEED;

  const response = await axios.post(
    SPEECH_URL,
    {
      model,
      voice,
      input: text,
      response_format: responseFormat,
      speed,
      instructions: mode === 'short'
        ? `${VOICE_INSTRUCTIONS} This is a short manager briefing.`
        : `${VOICE_INSTRUCTIONS} This is a standard manager briefing.`
    },
    {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        Authorization: buildAuthHeader(),
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    audioBuffer: Buffer.from(response.data),
    contentType: responseFormat === 'mp3' ? 'audio/mpeg' : `audio/${responseFormat}`,
    provider: 'openai',
    model,
    voice,
    responseFormat
  };
};

module.exports = {
  getStatus,
  generateSpeech
};
