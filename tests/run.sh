#!/bin/sh
# Run the pure-core smoke tests. Uses Node if available, otherwise falls back
# to macOS's built-in JavaScriptCore via osascript (no install required).
set -e
cd "$(dirname "$0")/.."

if command -v node >/dev/null 2>&1; then
  echo "[running with node]"
  exec node tests/smoke.mjs
fi

echo "[node not found — running with osascript / JavaScriptCore]"
CORE="$(python3 - <<'PY'
import re, sys
html = open('index.html', encoding='utf-8').read()
m = re.search(r'<script id="al-core">(.*?)</script>', html, re.S)
sys.stdout.write(m.group(1) if m else '')
PY
)"

TMP="$(mktemp -t aurallife).js"
trap 'rm -f "$TMP"' EXIT
{
  printf '%s\n' "$CORE"
  cat tests/assertions.js
  printf '\nglobalThis.runTests(globalThis.AuralLife);\n'
} > "$TMP"

osascript -l JavaScript "$TMP"
