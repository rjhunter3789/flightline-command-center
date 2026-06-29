#!/usr/bin/env python3
from pathlib import Path

root = Path.cwd()
jsx_path = root / 'frontend/src/components/Mobile/FlightlineMobile.jsx'
css_path = root / 'frontend/src/components/Mobile/FlightlineMobile.css'
doc_path = root / 'docs/FLIGHTLINE-MOBILE-THEME-LAYOUT-PHASE-7B-2026-06-26.md'

if not jsx_path.exists():
    raise SystemExit('Missing frontend/src/components/Mobile/FlightlineMobile.jsx')
if not css_path.exists():
    raise SystemExit('Missing frontend/src/components/Mobile/FlightlineMobile.css')

jsx = jsx_path.read_text()
css = css_path.read_text()

# 1. Theme helpers
old = '''  const demoDealership = {
    name: "FlightLine Demo"
  };
'''
new = '''  const demoDealership = {
    name: "FlightLine Demo"
  };

  const THEME_STORAGE_KEY = 'flightline.mobile.themePreference';

  const getInitialThemePreference = () => {
    if (typeof window === 'undefined') return 'system';
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'system';
  };

  const getSystemTheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
'''
if old not in jsx:
    raise SystemExit('Could not find demoDealership block')
jsx = jsx.replace(old, new, 1)

# 2. Theme state
old = '''    const [dealership, setDealership] = useState(demoDealership);
'''
new = '''    const [dealership, setDealership] = useState(demoDealership);
    const [themePreference, setThemePreference] = useState(getInitialThemePreference);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);
'''
if old not in jsx:
    raise SystemExit('Could not find dealership state block')
jsx = jsx.replace(old, new, 1)

# 3. Theme effects
old = '''    useEffect(() => {
      // Fetch initial data
      fetchDeals();
      fetchDealership();
    }, []);
'''
new = '''    useEffect(() => {
      // Fetch initial data
      fetchDeals();
      fetchDealership();
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return undefined;
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (event) => {
        setSystemTheme(event.matches ? 'dark' : 'light');
      };

      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
      }

      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }, [themePreference]);
'''
if old not in jsx:
    raise SystemExit('Could not find initial data effect block')
jsx = jsx.replace(old, new, 1)

# 4. Resolved theme before return
old = '''    const countsByStage = dealStages.reduce((acc, stage) => {
      acc[stage] = getDealsForStage(stage).length;
      return acc;
    }, {});

    return (
      <div className="flightline-mobile">
'''
new = '''    const countsByStage = dealStages.reduce((acc, stage) => {
      acc[stage] = getDealsForStage(stage).length;
      return acc;
    }, {});

    const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;

    return (
      <div className={`flightline-mobile theme-${resolvedTheme}`}>
'''
if old not in jsx:
    raise SystemExit('Could not find countsByStage return block')
jsx = jsx.replace(old, new, 1)

# 5. Header with theme selector
old = '''        {/* Header */}
        <header className="mobile-header">
          <div className="header-content">
            <h1 className="mobile-title">FlightLine</h1>
            <p className="mobile-subtitle">Mobile command for deal flow</p>
          </div>
          <span className="dealer-badge">
            {dealership?.name || 'FlightLine Demo'}
          </span>
        </header>
'''
new = '''        {/* Header */}
        <header className="mobile-header">
          <div className="header-content">
            <h1 className="mobile-title">FlightLine</h1>
            <p className="mobile-subtitle">Mobile command for deal flow</p>
          </div>
          <div className="mobile-header-actions">
            <span className="dealer-badge">
              {dealership?.name || 'FlightLine Demo'}
            </span>
            <div className="theme-toggle" role="group" aria-label="Theme mode">
              <button
                type="button"
                className={`theme-toggle-button ${themePreference === 'light' ? 'active' : ''}`}
                onClick={() => setThemePreference('light')}
                aria-pressed={themePreference === 'light'}
              >
                Light
              </button>
              <button
                type="button"
                className={`theme-toggle-button ${themePreference === 'dark' ? 'active' : ''}`}
                onClick={() => setThemePreference('dark')}
                aria-pressed={themePreference === 'dark'}
              >
                Dark
              </button>
              <button
                type="button"
                className={`theme-toggle-button ${themePreference === 'system' ? 'active' : ''}`}
                onClick={() => setThemePreference('system')}
                aria-pressed={themePreference === 'system'}
              >
                Device
              </button>
            </div>
          </div>
        </header>
'''
if old not in jsx:
    raise SystemExit('Could not find mobile header block')
jsx = jsx.replace(old, new, 1)

# 6. Reorder mobile content so Active Deals are above Flight Attendant and Quick Actions are compact
old = '''        <FlightAttendantSection
          deals={deals}
          countsByStage={countsByStage}
        />

        {/* Primary CTAs */}
        <section className="cta-section">
          <h2 className="section-title">Quick actions</h2>
          <div className="cta-grid">
            {primaryCtas.map((cta) => {
              const isActive = cta.id === selectedCta;
              return (
                <button
                  key={cta.id}
                  onClick={() => setSelectedCta(cta.id)}
                  className={`cta-button ${isActive ? 'active' : ''}`}
                >
                  <div className="cta-label">{cta.label}</div>
                  <div className="cta-description">{cta.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Content Based on Selected CTA */}
        {selectedCta === "activeDeals" && (
          <ActiveDealsSection
            selectedStage={selectedStage}
            onStageChange={setSelectedStage}
            deals={getDealsForStage(selectedStage)}
            countsByStage={countsByStage}
          />
        )}

'''
new = '''        <ActiveDealsSection
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          deals={getDealsForStage(selectedStage)}
          countsByStage={countsByStage}
        />

        <FlightAttendantSection
          deals={deals}
          countsByStage={countsByStage}
        />

        {/* Primary CTAs */}
        <section className="cta-section compact-actions">
          <h2 className="section-title">Quick actions</h2>
          <div className="cta-grid">
            {primaryCtas.map((cta) => {
              const isActive = cta.id === selectedCta;
              return (
                <button
                  key={cta.id}
                  onClick={() => setSelectedCta(cta.id)}
                  className={`cta-button ${isActive ? 'active' : ''}`}
                >
                  <div className="cta-label">{cta.label}</div>
                  <div className="cta-description">{cta.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Content Based on Selected CTA */}
'''
if old not in jsx:
    raise SystemExit('Could not find mobile content ordering block')
jsx = jsx.replace(old, new, 1)

# 7. Add Flight Attendant expanded-state
old = '''    const [conversationActive, setConversationActive] = useState(false);
'''
new = '''    const [conversationActive, setConversationActive] = useState(false);
    const [controlsExpanded, setControlsExpanded] = useState(false);
'''
if old not in jsx:
    raise SystemExit('Could not find conversationActive state block')
jsx = jsx.replace(old, new, 1)

# 8. Replace Flight Attendant JSX with compact default + expanded controls
start = '''    return (\n      <section className="flight-attendant-section">'''
end = '''  };\n\n  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {'''
if start not in jsx or end not in jsx:
    raise SystemExit('Could not find FlightAttendantSection JSX block')
prefix, rest = jsx.split(start, 1)
old_block, suffix = rest.split(end, 1)
new_block = '''    return (\n      <section className={`flight-attendant-section ${controlsExpanded ? 'expanded' : 'compact'}`}>
        <div className="section-header flight-attendant-header">
          <div>
            <h2 className="section-title">Flight Attendant</h2>
            <p className="section-hint">Deal-flow voice control</p>
          </div>
          <div className="flight-attendant-primary-actions">
            <button
              className="flight-attendant-speak primary-talk"
              onClick={conversationActive ? stopConversationSession : startConversationSession}
              disabled={isGeneratingPremiumVoice && !conversationActive}
            >
              {conversationActive ? (isListening ? 'Listening...' : 'End') : 'Talk'}
            </button>
            <button
              type="button"
              className="flight-attendant-expand"
              onClick={() => setControlsExpanded((current) => !current)}
              aria-expanded={controlsExpanded}
            >
              {controlsExpanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>

        <div className="flight-attendant-card">
          <p className="flight-attendant-script">{briefing}</p>
          <p className="flight-attendant-voice-status">{voiceInputStatus}</p>
          {recognizedCommand && controlsExpanded && (
            <p className="flight-attendant-voice-status">Heard: “{recognizedCommand}”</p>
          )}
          {controlsExpanded && (
            <p className="flight-attendant-voice-status">{voiceStatus}</p>
          )}
        </div>

        {controlsExpanded && (
          <div className="flight-attendant-expanded-controls">
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
              <button
                className="flight-attendant-speak secondary-speak"
                onClick={speakBriefing}
                disabled={isGeneratingPremiumVoice || isListening}
              >
                {isGeneratingPremiumVoice ? 'Generating...' : 'Speak Briefing'}
              </button>
              <button className="flight-attendant-stop" onClick={stopSpeaking}>
                Stop
              </button>
            </div>

            <p className="flight-attendant-voice-status flight-attendant-example">
              Try: “What needs attention?”, “active deals”, “deal flow”, “shorter version”, or “stop listening”.
            </p>

            <div className="flight-attendant-actions">
              <button
                className={`flight-attendant-button ${activeBriefing === 'activeDeals' ? 'active' : ''}`}
                onClick={() => handleBriefing('activeDeals')}
              >
                Active Deals
              </button>
              <button
                className={`flight-attendant-button ${activeBriefing === 'dealFlow' ? 'active' : ''}`}
                onClick={() => handleBriefing('dealFlow')}
              >
                Deal Flow
              </button>
              <button
                className={`flight-attendant-button ${activeBriefing === 'snapshot' ? 'active' : ''}`}
                onClick={() => handleBriefing('snapshot')}
              >
                Snapshot
              </button>
              <button
                className={`flight-attendant-button ${activeBriefing === 'attention' ? 'active' : ''}`}
                onClick={() => handleBriefing('attention')}
              >
                Attention
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const ActiveDealsSection = ({ selectedStage, onStageChange, deals, countsByStage }) => {'''
jsx = prefix + new_block + suffix

css_addition = r'''

/* Phase 7B — Mobile Theme + Layout Cleanup */
.flightline-mobile.theme-dark {
  --fl-bg: #020617;
  --fl-surface: #0f172a;
  --fl-surface-soft: rgba(15, 23, 42, 0.78);
  --fl-border: #1e293b;
  --fl-border-strong: #334155;
  --fl-text: #f8fafc;
  --fl-muted: #94a3b8;
  --fl-soft-text: #cbd5e1;
  --fl-accent: #22d3ee;
  --fl-accent-soft: rgba(34, 211, 238, 0.12);
  --fl-card-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
}

.flightline-mobile.theme-light {
  --fl-bg: #f8fafc;
  --fl-surface: #ffffff;
  --fl-surface-soft: rgba(255, 255, 255, 0.88);
  --fl-border: #dbe4ef;
  --fl-border-strong: #b8c7d9;
  --fl-text: #0f172a;
  --fl-muted: #64748b;
  --fl-soft-text: #334155;
  --fl-accent: #0ea5e9;
  --fl-accent-soft: rgba(14, 165, 233, 0.12);
  --fl-card-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.flightline-mobile {
  background: var(--fl-bg);
  color: var(--fl-text);
  gap: 12px;
  transition: background-color 180ms ease, color 180ms ease;
}

.mobile-header {
  gap: 10px;
}

.mobile-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.dealer-badge {
  background: var(--fl-surface);
  color: var(--fl-soft-text);
  border: 1px solid var(--fl-border);
}

.theme-toggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--fl-border);
  border-radius: 999px;
  background: var(--fl-surface-soft);
}

.theme-toggle-button {
  border: 0;
  border-radius: 999px;
  padding: 4px 7px;
  font-size: 10px;
  font-weight: 700;
  color: var(--fl-muted);
  background: transparent;
  cursor: pointer;
}

.theme-toggle-button.active {
  color: var(--fl-text);
  background: var(--fl-accent-soft);
}

.mobile-title,
.cta-label,
.staff-name,
.metric-value,
.total-count,
.deal-id {
  color: var(--fl-text);
}

.mobile-subtitle,
.section-title,
.section-hint,
.cta-description,
.deal-stage,
.deal-footer,
.metric-label,
.total-label,
.staff-metrics,
.deal-vehicle,
.flight-attendant-voice-status {
  color: var(--fl-muted);
}

.flight-attendant-section,
.deals-section,
.cta-section,
.totals-section,
.snapshot-section,
.staff-section,
.chat-section {
  gap: 8px;
}

.flight-attendant-section.compact {
  border: 1px solid var(--fl-border);
  border-radius: 18px;
  padding: 10px;
  background: var(--fl-surface-soft);
  box-shadow: var(--fl-card-shadow);
}

.flight-attendant-header {
  gap: 8px;
}

.flight-attendant-primary-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flight-attendant-card {
  border-color: var(--fl-border);
  background: var(--fl-surface);
  padding: 10px;
  box-shadow: none;
}

.flight-attendant-script {
  color: var(--fl-soft-text);
  font-size: 12px;
  line-height: 1.35;
}

.flight-attendant-expanded-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flight-attendant-controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.flight-attendant-actions {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.flight-attendant-button,
.flight-attendant-speak,
.flight-attendant-toggle,
.flight-attendant-stop,
.flight-attendant-expand,
.cta-button,
.stage-pill,
.deal-card,
.total-card,
.metric-card,
.staff-card {
  border-color: var(--fl-border);
  background: var(--fl-surface);
  color: var(--fl-soft-text);
  box-shadow: var(--fl-card-shadow);
}

.flight-attendant-speak.primary-talk {
  background: var(--fl-accent-soft);
  border-color: var(--fl-accent);
  color: var(--fl-text);
  min-width: 64px;
}

.flight-attendant-expand {
  border-radius: 9999px;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.flight-attendant-button.active,
.flight-attendant-toggle.active,
.cta-button.active,
.stage-pill.active {
  border-color: var(--fl-accent);
  background: var(--fl-accent-soft);
  color: var(--fl-text);
}

.flight-attendant-stop {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.35);
}

.cta-section {
  margin-top: 0;
}

.cta-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.cta-button {
  min-width: 138px;
  padding: 9px 10px;
  border-radius: 14px;
}

.cta-label {
  font-size: 12px;
}

.cta-description {
  display: none;
}

.stage-pills {
  gap: 6px;
  padding-bottom: 2px;
}

.stage-pill {
  padding: 6px 10px;
  font-size: 11px;
  flex: 0 0 auto;
}

.deals-list {
  max-height: none;
  gap: 7px;
}

.deal-card {
  border-radius: 14px;
  padding: 10px;
}

.deal-footer {
  flex-wrap: wrap;
  gap: 6px;
}

.no-deals {
  color: var(--fl-muted);
  border-color: var(--fl-border-strong);
  background: var(--fl-surface-soft);
}

.flightline-mobile ::-webkit-scrollbar-track,
.stage-pills::-webkit-scrollbar-track {
  background: var(--fl-border);
}

.flightline-mobile ::-webkit-scrollbar-thumb,
.stage-pills::-webkit-scrollbar-thumb {
  background: var(--fl-border-strong);
}

@media (max-width: 375px) {
  .theme-toggle-button {
    padding: 4px 5px;
    font-size: 9px;
  }

  .flight-attendant-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cta-button {
    min-width: 126px;
  }
}
'''

if 'Phase 7B — Mobile Theme + Layout Cleanup' not in css:
    css = css.rstrip() + css_addition + '\n'

jsx_path.write_text(jsx)
css_path.write_text(css)

doc_path.write_text('''# FlightLine Mobile Theme + Layout Cleanup — Phase 7B

**Date:** 2026-06-26  
**Status:** Patch prepared  
**Scope:** Frontend mobile UX only  
**System:** FlightLine Command Center  

---

## 1. Purpose

Phase 7B addresses two mobile usability issues identified from the FlightLine PWA screenshot:

1. The current mobile experience is too dark as the only presentation mode.
2. The first mobile viewport is crowded, with Flight Attendant controls dominating the screen and Active Deals pushed too low.

This phase is intentionally frontend-only.

No backend routes, Phase 7 integration endpoints, authentication, or voice engine logic should be changed.

---

## 2. Changes

Phase 7B adds:

- Light / Dark / Device theme selector in the mobile header.
- Theme persistence using `localStorage`.
- Device mode using `prefers-color-scheme`.
- Active Deals moved above Flight Attendant.
- Flight Attendant compact by default.
- One primary Talk button visible by default.
- Secondary voice controls moved behind a More/Less expansion control.
- Quick Actions converted to a more compact horizontal row.
- Reduced card padding and vertical crowding.
- More flexible stage pills and deal cards.

---

## 3. Files Changed

```text
frontend/src/components/Mobile/FlightlineMobile.jsx
frontend/src/components/Mobile/FlightlineMobile.css
```

---

## 4. Acceptance Criteria

Phase 7B is accepted when:

- Mobile users can choose Light, Dark, or Device mode.
- Theme preference persists after refresh.
- Device mode follows the phone/browser appearance setting.
- Active Deals appear higher on the mobile page.
- Flight Attendant is compact by default.
- Talk remains visible and usable.
- Speak Briefing, Short/Standard, Stop, and prompt buttons remain available under More.
- Quick Actions are less visually dominant.
- Stage pills do not clip awkwardly.
- Voice controls still work.
- Existing backend and Phase 7 integration endpoints are unaffected.

---

## 5. Validation Commands

```bash
cd /var/www/flightline/frontend
npm run build
```

Recommended mobile QA:

```text
1. Open FlightLine on iPhone.
2. Confirm Device is the default theme.
3. Switch to Light mode.
4. Refresh and confirm Light persists.
5. Switch to Dark mode.
6. Refresh and confirm Dark persists.
7. Switch back to Device.
8. Confirm Active Deals are higher on the page.
9. Confirm Flight Attendant is compact.
10. Tap More and confirm voice controls are still available.
11. Tap Talk and confirm the voice loop still works.
12. Confirm Quick Actions are compact and usable.
```

---

## 6. Final Note

This phase should make the mobile PWA feel calmer and more operational without removing any functionality.
''')

print('Applied FlightLine Phase 7B mobile theme and layout patch.')
print('Updated frontend/src/components/Mobile/FlightlineMobile.jsx')
print('Updated frontend/src/components/Mobile/FlightlineMobile.css')
print('Wrote docs/FLIGHTLINE-MOBILE-THEME-LAYOUT-PHASE-7B-2026-06-26.md')
