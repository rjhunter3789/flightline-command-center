const express = require('express');
const logger = require('../utils/logger');
const openaiVoiceProvider = require('../services/openaiVoiceProvider');

const router = express.Router();

const MAX_TTS_TEXT_LENGTH = 1200;
const ALLOWED_BRIEFING_TYPES = new Set([
  'activeDeals',
  'dealFlow',
  'snapshot',
  'attention'
]);
const ALLOWED_MODES = new Set([
  'short',
  'standard'
]);

const getFallbackResponse = () => ({
  success: false,
  configured: false,
  provider: 'openai',
  error: 'Premium voice is not configured yet.',
  fallbackAllowed: true,
  fallbackMessage: 'Premium voice is unavailable right now. Using device voice.'
});

router.get('/tts/status', (req, res) => {
  const status = openaiVoiceProvider.getStatus();

  res.status(200).json({
    success: true,
    configured: status.configured,
    provider: status.provider,
    model: status.model,
    voice: status.voice,
    responseFormat: status.responseFormat,
    fallbackAllowed: true,
    message: status.configured
      ? 'OpenAI premium voice is configured.'
      : 'Premium voice is not configured. Native browser voice fallback should be used.'
  });
});

router.post('/tts', async (req, res) => {
  const { text, briefingType, mode = 'short' } = req.body || {};
  const cleanedText = typeof text === 'string' ? text.trim() : '';

  if (!cleanedText) {
    return res.status(400).json({
      success: false,
      error: 'Briefing text is required.',
      fallbackAllowed: true
    });
  }

  if (cleanedText.length > MAX_TTS_TEXT_LENGTH) {
    return res.status(413).json({
      success: false,
      error: `Briefing text exceeds ${MAX_TTS_TEXT_LENGTH} characters.`,
      maxLength: MAX_TTS_TEXT_LENGTH,
      fallbackAllowed: true
    });
  }

  if (briefingType && !ALLOWED_BRIEFING_TYPES.has(briefingType)) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported briefing type.',
      allowedBriefingTypes: Array.from(ALLOWED_BRIEFING_TYPES),
      fallbackAllowed: true
    });
  }

  if (!ALLOWED_MODES.has(mode)) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported briefing mode.',
      allowedModes: Array.from(ALLOWED_MODES),
      fallbackAllowed: true
    });
  }

  if (!openaiVoiceProvider.getStatus().configured) {
    logger.info('Flight Attendant OpenAI voice requested but provider is not configured', {
      briefingType: briefingType || 'unknown',
      mode,
      textLength: cleanedText.length
    });

    return res.status(503).json(getFallbackResponse());
  }

  try {
    const result = await openaiVoiceProvider.generateSpeech({
      text: cleanedText,
      mode,
      briefingType
    });

    logger.info('Flight Attendant OpenAI voice generated', {
      briefingType: briefingType || 'unknown',
      mode,
      textLength: cleanedText.length,
      provider: result.provider,
      model: result.model,
      voice: result.voice
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('X-Flightline-Voice-Provider', result.provider);
    res.setHeader('X-Flightline-Voice-Model', result.model);
    res.setHeader('X-Flightline-Voice-Name', result.voice);
    return res.status(200).send(result.audioBuffer);
  } catch (error) {
    logger.error('Flight Attendant OpenAI voice failed', {
      message: error.message,
      code: error.code,
      briefingType: briefingType || 'unknown',
      mode,
      textLength: cleanedText.length
    });

    if (error.code === 'VOICE_PROVIDER_NOT_CONFIGURED') {
      return res.status(503).json(getFallbackResponse());
    }

    return res.status(502).json({
      success: false,
      configured: true,
      provider: 'openai',
      error: 'Premium voice generation failed.',
      fallbackAllowed: true,
      fallbackMessage: 'Premium voice is unavailable right now. Using device voice.'
    });
  }
});

module.exports = router;
