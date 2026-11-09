#!/usr/bin/env bash
# Prints the part of a failed step's log that explains the failure, for the
# report comment on the PR. ANSI colour codes and GitHub workflow command lines
# (`##[group]`, `::error::`) are stripped, so the output is plain text.
#
# Usage:
#   scripts/integration-failure.sh <step name> <log file>
#
# A step whose name contains "end-to-end" is the Playwright run: its excerpt is
# the list reporter's failure section, from the first `  1) ` line to the end.
# Without such a line, and for any other step, the last 60 lines.
#
# Output (stdout, exit 0): the step name on the first line, then the excerpt,
# capped at 30000 bytes (the end is kept). A missing or empty log says so.
set -euo pipefail
export LC_ALL=C

max=30000
name="${1:-unknown step}"
log="${2:-}"

echo "$name"
if [ -z "$log" ] || [ ! -s "$log" ]; then
  echo "no log was captured for this step."
  exit 0
fi

esc="$(printf '\033')"
stripped="$(sed -e "s/${esc}\[[0-9;?]*[A-Za-z]//g" -e '/^##\[/d' -e '/^::/d' "$log" | tr -d '\r')"

section=""
if [[ "$name" == *end-to-end* ]]; then
  section="$(awk 'found || /^[[:space:]]+1\) /{found = 1; print}' <<<"$stripped")"
fi
if [ -z "$section" ]; then
  section="$(tail -n 60 <<<"$stripped")"
fi
if [ -z "$section" ]; then
  section="(the log has no output once control codes are removed)"
fi

# Bytes, not characters (LC_ALL=C above). The budget leaves room for the step
# name line and the newline that ends the excerpt.
budget=$((max - ${#name} - 2))
if [ "${#section}" -gt "$budget" ]; then
  marker=$'…(truncated)\n'
  keep=$((budget - ${#marker}))
  tail="${section: -keep}"
  # The cut can start inside a multibyte character: drop that partial first line.
  if [[ "$tail" == *$'\n'* ]]; then
    tail="${tail#*$'\n'}"
  fi
  section="$marker$tail"
fi

printf '%s\n' "$section"
