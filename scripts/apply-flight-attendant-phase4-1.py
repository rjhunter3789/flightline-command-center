from pathlib import Path

mobile_path = Path("frontend/src/components/Mobile/FlightlineMobile.jsx")
helper_path = Path("frontend/src/utils/flightAttendantAudio.js")

mobile = mobile_path.read_text()
helper = helper_path.read_text()

mobile = mobile.replace(
    "import './FlightlineMobile.css';\nimport { playPremiumFlightAttendantBriefing, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';",
    "import './FlightlineMobile.css';\n  import { playPremiumFlightAttendantBriefing, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';"
)

old_state = """    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
"""
new_state = """    const [availableVoices, setAvailableVoices] = useState([]);
    const [voiceStatus, setVoiceStatus] = useState('Native browser voice');
    const [isGeneratingPremiumVoice, setIsGeneratingPremiumVoice] = useState(false);
"""
if old_state not in mobile:
    raise SystemExit("Could not find Flight Attendant state block. No changes made.")
mobile = mobile.replace(old_state, new_state, 1)

old_stop = """    const stopSpeaking = () => {
      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceStatus('Speech stopped');
    };
"""
new_stop = """    const stopSpeaking = () => {
      stopPremiumFlightAttendantAudio();
      setIsGeneratingPremiumVoice(false);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceStatus('Speech stopped');
    };
"""
if old_stop not in mobile:
    raise SystemExit("Could not find stopSpeaking block. No changes made.")
mobile = mobile.replace(old_stop, new_stop, 1)

old_speak = """    const speakBriefing = async () => {
      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      await playPremiumFlightAttendantBriefing({
        briefingType: activeBriefing || 'activeDeals',
        mode: briefingMode,
        text: briefing,
        onStatus: setVoiceStatus,
        onFallback: speakWithNativeBrowserVoice
      });
    };
"""
new_speak = """    const speakBriefing = async () => {
      if (isGeneratingPremiumVoice) return;

      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      await playPremiumFlightAttendantBriefing({
        briefingType: activeBriefing || 'activeDeals',
        mode: briefingMode,
        text: briefing,
        onStatus: setVoiceStatus,
        onPreparing: setIsGeneratingPremiumVoice,
        onFallback: speakWithNativeBrowserVoice
      });
    };
"""
if old_speak not in mobile:
    raise SystemExit("Could not find speakBriefing block. No changes made.")
mobile = mobile.replace(old_speak, new_speak, 1)

old_button = """          <button className="flight-attendant-speak" onClick={speakBriefing}>
            Speak Briefing
          </button>
"""
new_button = """          <button
            className="flight-attendant-speak"
            onClick={speakBriefing}
            disabled={isGeneratingPremiumVoice}
          >
            {isGeneratingPremiumVoice ? 'Generating...' : 'Speak Briefing'}
          </button>
"""
if old_button not in mobile:
    raise SystemExit("Could not find Speak Briefing button. No changes made.")
mobile = mobile.replace(old_button, new_button, 1)

helper = helper.replace(
    "  onStatus,\n  onFallback\n}) => {",
    "  onStatus,\n  onPreparing,\n  onFallback\n}) => {"
)
helper = helper.replace(
    "  const setStatus = typeof onStatus === 'function' ? onStatus : () => {};\n  const fallback = typeof onFallback === 'function' ? onFallback : () => {};",
    "  const setStatus = typeof onStatus === 'function' ? onStatus : () => {};\n  const setPreparing = typeof onPreparing === 'function' ? onPreparing : () => {};\n  const fallback = typeof onFallback === 'function' ? onFallback : () => {};"
)
helper = helper.replace(
    "  if (!text) {\n    setStatus('No briefing available to speak.');\n    return false;\n  }\n\n  setStatus('Requesting premium voice...');",
    "  if (!text) {\n    setPreparing(false);\n    setStatus('No briefing available to speak.');\n    return false;\n  }\n\n  setPreparing(true);\n  setStatus('Generating premium voice...');"
)
helper = helper.replace(
    "      setStatus('Premium voice unavailable. Using device voice.');\n      fallback();",
    "      setPreparing(false);\n      setStatus('Premium voice unavailable. Using device voice.');\n      fallback();",
    1
)
helper = helper.replace(
    "    setStatus('Speaking with premium voice');\n    await audio.play();",
    "    setStatus('Speaking with premium voice');\n    setPreparing(false);\n    await audio.play();"
)
helper = helper.replace(
    "    stopPremiumFlightAttendantAudio();\n    setStatus('Premium voice unavailable. Using device voice.');\n    fallback();",
    "    stopPremiumFlightAttendantAudio();\n    setPreparing(false);\n    setStatus('Premium voice unavailable. Using device voice.');\n    fallback();"
)

mobile_path.write_text(mobile)
helper_path.write_text(helper)
print("Patched Flight Attendant Phase 4.1 latency polish.")
