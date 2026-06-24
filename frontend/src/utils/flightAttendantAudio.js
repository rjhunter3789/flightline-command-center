let activePremiumAudio = null;
let activePremiumAudioUrl = null;

export const stopPremiumFlightAttendantAudio = () => {
  if (activePremiumAudio) {
    activePremiumAudio.pause();
    activePremiumAudio.currentTime = 0;
    activePremiumAudio = null;
  }

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
  onFallback
}) => {
  stopPremiumFlightAttendantAudio();

  const setStatus = typeof onStatus === 'function' ? onStatus : () => {};
  const setPreparing = typeof onPreparing === 'function' ? onPreparing : () => {};
  const fallback = typeof onFallback === 'function' ? onFallback : () => {};

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
      setStatus('Premium voice unavailable. Using device voice.');
      fallback();
      return false;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    activePremiumAudio = audio;
    activePremiumAudioUrl = audioUrl;

    audio.onended = () => {
      stopPremiumFlightAttendantAudio();
      setStatus('Premium voice ready');
    };

    audio.onerror = () => {
      stopPremiumFlightAttendantAudio();
      setStatus('Premium voice playback failed. Using device voice.');
      fallback();
    };

    setStatus('Speaking with premium voice');
    setPreparing(false);
    await audio.play();
    return true;
  } catch (error) {
    console.error('Premium voice error:', error);
    stopPremiumFlightAttendantAudio();
    setPreparing(false);
    setStatus('Premium voice unavailable. Using device voice.');
    fallback();
    return false;
  }
};
