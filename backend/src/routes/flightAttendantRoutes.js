const express = require('express');
const logger = require('../utils/logger');

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

router.get('/tts/status', (req, res) => {
  res.status(200).json({
    success: true,
    configured: false,
    provider: null,
    fallbackAllowed: true,
    message: 'Premium voice is not configured. Native browser voice fallback should be used.'
  });
});

router.post('/tts', (req, res) => {
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

  logger.info('Flight Attendant premium voice requested but provider is not configured', {
    briefingType: briefingType || 'unknown',
    mode,
    textLength: cleanedText.length
  });

  return res.status(503).json({
    success: false,
    configured: false,
    provider: null,
    error: 'Premium voice is not configured yet.',
    fallbackAllowed: true,
    fallbackMessage: 'Premium voice is unavailable right now. Using device voice.'
  });
});

module.exports = router;
