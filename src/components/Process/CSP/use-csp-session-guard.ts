import { useElection } from '@vocdoni/react-components'
import { CensusType, InvalidElection } from '@vocdoni/sdk'
import { useEffect, useRef } from 'react'

/**
 * For CSP elections a stored auth token does not guarantee the voter belongs to
 * *this* election's census: the token may have been issued for a different
 * bundle. The election provider now resolves real membership against the bundle
 * `/check` endpoint, so once that check has run and reports the voter is not in
 * the census we close the CSP session.
 *
 * Closing the session (rather than leaving a connected-but-ineligible state)
 * makes the UI fall back to the "Identify" button instead of showing a
 * misleading "Logout", matching what the user expects when their credentials
 * don't grant access to this election.
 *
 * Mount this once per process voting view (it is a no-op for non-CSP censuses).
 */
export const useCspSessionGuard = () => {
  const {
    election,
    connected,
    isInCensus,
    clearClient,
    loading: { census: loadingCensus } = {},
    loaded: { census: loadedCensus } = {},
  } = useElection()

  // Whether a membership check actually ran for the *current* session. Without
  // it, the stale `loaded.census` left over from a previous session could
  // trigger a premature close right after the voter re-identifies.
  const membershipChecked = useRef(false)

  const isCsp = !(election instanceof InvalidElection) && election?.census?.type === CensusType.CSP

  // A census fetch is in flight: mark that a fresh membership check has started.
  useEffect(() => {
    if (loadingCensus) {
      membershipChecked.current = true
    }
  }, [loadingCensus])

  useEffect(() => {
    // Reset the guard whenever there's no live CSP session to evaluate.
    if (!isCsp || !connected) {
      membershipChecked.current = false
      return
    }

    // Only act once the in-flight check has resolved to "not in census".
    if (membershipChecked.current && loadedCensus && !loadingCensus && !isInCensus) {
      membershipChecked.current = false
      clearClient()
    }
  }, [isCsp, connected, isInCensus, loadedCensus, loadingCensus, clearClient])
}
