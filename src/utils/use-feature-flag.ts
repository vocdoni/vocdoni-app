import { useEffect, useState } from 'react'
import { onPosthogFeatureFlags } from '~utils/analytics'

/**
 * Reads a PostHog feature flag. Returns `undefined` until flags have loaded
 * (render your default state), then the flag value. When PostHog is disabled
 * (no POSTHOG_KEY, rejected consent, voting routes) it stays `undefined`
 * forever, so defaults must always be safe.
 *
 * Flags are never bootstrapped server-side: SSR HTML is cached across users,
 * so per-user payloads must not be injected there.
 */
export const useFeatureFlag = (flag: string): boolean | undefined => {
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)

  useEffect(() => onPosthogFeatureFlags((isEnabled) => setEnabled(isEnabled(flag))), [flag])

  return enabled
}
