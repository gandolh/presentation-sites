#!/usr/bin/env bash
# shoot.sh <width> <height> <out.png> [scrollY or #id]
# Set AGENT_BROWSER_SOCKET_DIR first if the browser tool can't create its default socket folder.
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="file://$HERE/sketch.html"
agent-browser set viewport "$1" "$2" >/dev/null
agent-browser open "$URL" >/dev/null
agent-browser eval 'document.fonts.ready.then(()=>document.fonts.size)' >/dev/null
if [ -n "$4" ]; then
  if [[ "$4" == \#* ]]; then agent-browser eval "document.querySelector('$4').scrollIntoView({block:'start'}); window.scrollBy(0, ${5:-0}); 1" >/dev/null
  else agent-browser eval "window.scrollTo(0, $4); 1" >/dev/null; fi
  sleep 0.8
fi
sleep 0.4
agent-browser screenshot "$3" >/dev/null
echo "shot $3"
