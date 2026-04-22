#!/usr/bin/env bash
set -euo pipefail

FILE="${1:?file path required}"
MODE="${2:?mode required (popup|window|print)}"

if { [ "$MODE" = "popup" ] || [ "$MODE" = "window" ]; } && [ -z "${TMUX:-}" ]; then
  echo "cc-transcript: \$TMUX unset, falling back to print mode" >&2
  MODE=print
fi

printf '%s\n' "$FILE"

case "$MODE" in
  popup)
    tmux display-popup -E -w 90% -h 90% "vim $(printf '%q' "$FILE")"
    ;;
  window)
    tmux new-window -n cc-transcript "vim $(printf '%q' "$FILE")"
    ;;
  print)
    ;;
  *)
    echo "cc-transcript: unknown mode '$MODE' (use popup|window|print)" >&2
    exit 2
    ;;
esac
