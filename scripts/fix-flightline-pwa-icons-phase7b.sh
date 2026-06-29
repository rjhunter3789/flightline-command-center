#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f frontend/public/apple-touch-icon.png ]; then
  echo "Missing frontend/public/apple-touch-icon.png"
  echo "Run the PWA icon patch first or restore the apple touch icon."
  exit 1
fi

cp frontend/public/apple-touch-icon.png frontend/public/icon-192.png
cp frontend/public/apple-touch-icon.png frontend/public/icon-512.png

cat > frontend/public/manifest.json <<'EOF'
{
  "short_name": "FlightLine",
  "name": "FlightLine Command Center",
  "description": "Mobile command for dealership deal flow",
  "start_url": ".",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0F172A",
  "theme_color": "#0F172A",
  "icons": [
    {
      "src": "apple-touch-icon.png?v=3",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-192.png?v=3",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512.png?v=3",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
EOF

python3 - <<'PY'
from pathlib import Path

path = Path("frontend/public/index.html")
text = path.read_text()

text = text.replace(
    '<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />',
    '<link rel="icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=3" />'
)
text = text.replace(
    '<link rel="icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=2" />',
    '<link rel="icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=3" />'
)

anchor = '    <meta name="viewport" content="width=device-width, initial-scale=1" />'
insert_block = '''    <link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=3" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json?v=3" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="FlightLine" />'''

# Remove older duplicate PWA lines first.
lines_to_remove = [
    '    <link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=2" />',
    '    <link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png?v=3" />',
    '    <link rel="manifest" href="%PUBLIC_URL%/manifest.json?v=2" />',
    '    <link rel="manifest" href="%PUBLIC_URL%/manifest.json?v=3" />',
    '    <meta name="apple-mobile-web-app-capable" content="yes" />',
    '    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
    '    <meta name="apple-mobile-web-app-title" content="FlightLine" />',
]
for line in lines_to_remove:
    text = text.replace(line + '\n', '')

text = text.replace(anchor, insert_block + '\n' + anchor)

text = text.replace(
    'content="Flightline - Dealership Command Center"',
    'content="FlightLine - Dealership Deal-Flow Command Center"'
)
text = text.replace(
    '<title>Flightline - Command Center</title>',
    '<title>FlightLine - Command Center</title>'
)

path.write_text(text)
print("Updated frontend/public/index.html")
PY

python3 - <<'PY'
from pathlib import Path

path = Path("docs/FLIGHTLINE-MOBILE-THEME-LAYOUT-PHASE-7B-2026-06-26.md")
if path.exists():
    text = path.read_text()
    note = """

## PWA Icon Update

- PWA home-screen icon wired for iPhone.
- Added apple-touch-icon.png.
- Added icon-192.png and icon-512.png from the same FL mark.
- Added manifest.json.
- Updated index.html with Apple mobile web app metadata.
"""
    if "## PWA Icon Update" not in text:
        text += note
    path.write_text(text)
    print("Updated Phase 7B documentation")
PY

echo "FlightLine PWA icon fix complete."
