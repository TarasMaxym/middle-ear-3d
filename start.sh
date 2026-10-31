#!/usr/bin/env zsh
set -e
cd "$(dirname "$0")"

MODE="local"
PORT="8765"

for arg in "$@"; do
  if [[ "$arg" == "--lan" || "$arg" == "--wifi" ]]; then
    MODE="lan"
  elif [[ "$arg" =~ ^[0-9]+$ ]]; then
    PORT="$arg"
  fi
done

if [[ "$MODE" == "lan" ]]; then
  BIND_ADDR="0.0.0.0"
  LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname)
  URL="http://${LAN_IP}:${PORT}"
  LOCAL_URL="http://127.0.0.1:${PORT}"
else
  BIND_ADDR="127.0.0.1"
  URL="http://127.0.0.1:${PORT}"
  LOCAL_URL="${URL}"
fi

# In local-only mode, reuse an already healthy server on 127.0.0.1
if [[ "$MODE" == "local" ]] && curl -sf -m 1 "${LOCAL_URL}/" >/dev/null 2>&1 ; then
  echo "Middle Ear 3D is already running at ${LOCAL_URL} — opening in your browser..."
  open "${LOCAL_URL}"
  exit 0
fi

# Clean up any existing listener on this port before rebinding (e.g. switching 127.0.0.1 -> 0.0.0.0)
STALE_PIDS=$(/usr/sbin/lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)
if [[ -n "${STALE_PIDS}" ]]; then
  echo "Restarting listener on port ${PORT} (${BIND_ADDR})..."
  kill ${=STALE_PIDS} 2>/dev/null || true
  sleep 0.35
fi

echo "============================================================"
echo "  Middle Ear 3D Room Diorama"
if [[ "$MODE" == "lan" ]]; then
  echo "  This Mac:            ${LOCAL_URL}"
  echo "  Same-Wi-Fi Devices:  ${URL}  (Open on Phone / iPad / Friend's Laptop)"
else
  echo "  Local URL:           ${LOCAL_URL}"
  echo "  (Tip: Run './start.sh --lan' to share across your Wi-Fi!)"
fi
echo "  Keep this window open while exploring (Ctrl+C to stop)."
echo "============================================================"

(sleep 0.6 && open "${LOCAL_URL}") &
exec python3 -m http.server "${PORT}" --bind "${BIND_ADDR}"
