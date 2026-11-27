#!/usr/bin/env bash
# Writes the markdown the report job posts to the PR, on stdout.
#
# Usage:
#   scripts/integration-report.sh > report.md
#
# EVENT=issue_comment is the reply to a `/integration` comment. EVENT=pull_request
# is the report of a push run on a PR, posted as a new comment each time.
# STICKY is true when the comment, or the PR's sticky state on a push run, re-runs the suite on push.
#
# Env: EVENT, REPO, SERVER_URL, RUN_URL, PARSED, RESOLVE, RESULT, RESET, STICKY,
#   CHECKOUT, HEAD_SHA, SEQUENCER_REF, SAAS_REF, SDK_REF, SEQUENCER_SHA, SAAS_SHA, SDK_SHA,
#   FAILURE (the e2e failure excerpt), ERROR (the resolve error, one line).
# Output (stdout, exit 0): the markdown. The failure text goes in a collapsed block
# whose fence the text itself cannot close.
set -euo pipefail

: "${EVENT:=}" "${REPO:=}" "${SERVER_URL:=}" "${RUN_URL:=}" "${PARSED:=}" "${RESOLVE:=}" "${RESULT:=}"
: "${RESET:=}" "${STICKY:=}" "${CHECKOUT:=}" "${HEAD_SHA:=}" "${SEQUENCER_REF:=}" "${SAAS_REF:=}" "${SDK_REF:=}"
: "${SEQUENCER_SHA:=}" "${SAAS_SHA:=}" "${SDK_SHA:=}" "${FAILURE:=}" "${ERROR:=}"

# upstream <label> <repo> <ref> <sha> <unpinned label>: one line per upstream,
# 'ref → sha' when pinned. Only a full 40-digit lowercase hex SHA is printed as a
# link; anything else gets 'not built'.
upstream() {
  local label="$1" repo="$2" ref="$3" sha="$4" unpinned="$5"
  local base="https://github.com/vocdoni/$repo" ref_link sha_link
  if [ -z "$ref" ]; then
    echo "- $label: $unpinned"
    return
  fi
  if [[ "$ref" =~ ^#([0-9]+)$ ]]; then
    ref_link="$base/pull/${BASH_REMATCH[1]}"
  elif [[ "$ref" =~ ^[0-9A-Fa-f]{7,40}$ ]]; then
    ref_link="$base/commit/$ref"
  else
    ref_link="[\`$ref\`]($base/tree/$ref)"
  fi
  if [[ "$sha" =~ ^[0-9a-f]{40}$ ]]; then
    sha_link="$base/commit/$sha"
  else
    sha_link='not built'
  fi
  echo "- $label: $ref_link → $sha_link"
}

# app_line: the App line. CHECKOUT and HEAD_SHA are full SHAs when resolved.
app_line() {
  if [[ "$CHECKOUT" =~ ^[0-9a-f]{40}$ && "$HEAD_SHA" =~ ^[0-9a-f]{40}$ ]]; then
    echo "- App: merge of $SERVER_URL/$REPO/commit/$HEAD_SHA ($SERVER_URL/$REPO/commit/$CHECKOUT)"
  else
    echo "- App: not resolved"
  fi
}

# error_code: the resolve error as inline code. Backticks are stripped, so the
# text cannot close the code span.
error_code="\`${ERROR//\`/}\`"

# failure_block <text>: the text in a collapsed block. Lines starting with `~~~`
# (after optional indentation) are dropped, so PR-controlled text cannot close the fence.
failure_block() {
  local text="$1" line
  [ -n "$text" ] || return 0
  echo
  echo '<details><summary>Failure output</summary>'
  echo
  echo '~~~~~'
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*~~~ ]] && continue
    printf '%s\n' "$line"
  done <<<"$text"
  echo '~~~~~'
  echo '</details>'
}

# The failure block shows the e2e excerpt, or the resolve error when there is none.
excerpt="${FAILURE:-$ERROR}"

case "$RESULT" in
  success) icon='✅' ;;
  failure) icon='❌' ;;
  *) icon='⚠️' ;;
esac

if [ "$EVENT" = pull_request ]; then
  echo "$icon Integration run on push: **$RESULT**"
  echo
  app_line
  upstream vocdoni-sequencer vocdoni-sequencer "$SEQUENCER_REF" "$SEQUENCER_SHA" ':main image'
  upstream saas-backend saas-backend "$SAAS_REF" "$SAAS_SHA" ':main image'
  upstream integrator-sdk vocdoni-integrator-sdk "$SDK_REF" "$SDK_SHA" 'npm (lockfile)'
  echo "- Run: $RUN_URL"
  echo
  if [ -n "$SEQUENCER_REF$SAAS_REF$SDK_REF" ]; then
    echo "The refs come from this PR's sticky \`/integration\` comment, re-resolved on this push."
  elif [ "$STICKY" = true ]; then
    echo "No ref is pinned: this PR has a sticky \`/integration\` comment with no refs, so it ran against the :main images and npm packages."
  else
    echo "No ref is pinned: this PR targets stage or main, so it ran against the :main images and npm packages."
  fi
  failure_block "$excerpt"
  exit 0
fi

{
  if [ "$PARSED" != true ]; then
    if [ -n "$ERROR" ]; then
      echo "❌ Integration run: **rejected**: $error_code"
      echo
      echo "- Run: $RUN_URL"
    else
      echo "❌ Integration run: **rejected**: the \`/integration\` command could not be parsed, see the run log."
    fi
  elif [ "$RESOLVE" != success ]; then
    if [ -n "$ERROR" ]; then
      echo "❌ Integration run: **error** resolving the PR ($RESOLVE): $error_code"
      echo
      echo "- Run: $RUN_URL"
    else
      echo "❌ Integration run: **error** resolving the PR ($RESOLVE), see the run log; comment again to retry."
    fi
  elif [ "$RESET" = true ]; then
    echo "Sticky integration run cleared; pushes to this PR no longer re-run the suite unless it targets stage or main."
    echo
    echo "- Run: $RUN_URL"
  else
    echo "$icon Integration run: **$RESULT**"
    echo
    app_line
    upstream vocdoni-sequencer vocdoni-sequencer "$SEQUENCER_REF" "$SEQUENCER_SHA" ':main image'
    upstream saas-backend saas-backend "$SAAS_REF" "$SAAS_SHA" ':main image'
    upstream integrator-sdk vocdoni-integrator-sdk "$SDK_REF" "$SDK_SHA" 'npm (lockfile)'
    echo "- Run: $RUN_URL"
    if [ "$STICKY" = true ] && [ -n "$SEQUENCER_REF$SAAS_REF$SDK_REF" ]; then
      echo
      echo "These refs are re-resolved on every push to this PR until \`/integration reset\`."
    elif [ "$STICKY" = true ]; then
      echo
      echo "Pushes to this PR also run the suite, against the \`:main\` images and npm packages. \`/integration reset\` turns that off, except on a PR into stage or main. A push whose merge with the base predates this behaviour still treats a bare \`/integration\` as one-shot."
    else
      echo
      echo "One-shot run: pushes to this PR keep running as they did before this comment."
    fi
  fi
  failure_block "$excerpt"
}
