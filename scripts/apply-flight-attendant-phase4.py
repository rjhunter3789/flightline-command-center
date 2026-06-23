from pathlib import Path

p = Path("frontend/src/components/Mobile/FlightlineMobile.jsx")
s = p.read_text()

s = s.replace(
    "import './FlightlineMobile.css';",
    "import './FlightlineMobile.css';\nimport { playPremiumFlightAttendantBriefing, stopPremiumFlightAttendantAudio } from '../../utils/flightAttendantAudio';"
)

old_stop = """    const stopSpeaking = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setVoiceStatus('Speech stopped');
      }
    };

"""

new_stop = """    const stopSpeaking = () => {
      stopPremiumFlightAttendantAudio();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceStatus('Speech stopped');
    };

"""

if old_stop not in s:
    raise SystemExit("Could not find stopSpeaking block. No changes made.")

s = s.replace(old_stop, new_stop, 1)

old_native = "    const speakBriefing = () => {"
new_native = "    const speakWithNativeBrowserVoice = () => {"

if old_native not in s:
    raise SystemExit("Could not find speakBriefing function. No changes made.")

s = s.replace(old_native, new_native, 1)

section_return = '    return (\n      <section className="flight-attendant-section">'

new_speak = """    const speakBriefing = async () => {
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

if section_return not in s:
    raise SystemExit("Could not find Flight Attendant section return. No changes made.")

s = s.replace(section_return, new_speak + section_return, 1)

p.write_text(s)
print("Patched FlightlineMobile.jsx for Phase 4 premium playback.")
