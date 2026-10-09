import type { ProcessVerification } from '@vocdoni/metadata-verify'
import { ComponentsProvider, useComponents, useElection } from '@vocdoni/react-components'
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createBlobUrls, resolveMediaSrc, voteGate, type VoteGate } from './gate'
import { useMetadataVerification, type MetadataVerificationSource } from './useMetadataVerification'

export type MetadataVerificationContextValue = {
  /** False when there is nothing to check; the indicator then renders nothing. */
  enabled: boolean
  pending: boolean
  failed: boolean
  data?: ProcessVerification
  gate: VoteGate
  /** The `src` to render a displayed image from (see `resolveMediaSrc`). */
  srcFor: (url?: string) => string | undefined
}

export const MetadataVerificationContext = createContext<MetadataVerificationContextValue | null>(null)

/** Null outside a {@link MetadataVerificationProvider}: shared slots then render as before. */
export const useMetadataVerificationContext = () => useContext(MetadataVerificationContext)

/**
 * Runs the ballot verification once for the voter page and shares its result: the indicator,
 * the vote button gate and the images rendered from their verified bytes all read it here.
 *
 * Images reach the page through the `resolveMediaUrl` of `@vocdoni/react-components`: the
 * SDK's election components and the app's own (via `useResolveMediaUrl`) render a committed
 * image only from the object URL of its verified bytes, and treat it as pending until then.
 */
export const MetadataVerificationProvider = ({
  children,
  source = 'saas',
}: PropsWithChildren<{ source?: MetadataVerificationSource }>) => {
  const { election } = useElection()
  const { enabled, data, isPending, isError } = useMetadataVerification(source)
  const parent = election as { upstreamId?: string; metadataURL?: string; metadataHash?: string } | null
  const hasParent = !!(parent?.upstreamId || parent?.metadataURL || parent?.metadataHash)
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})

  // Object URLs live as long as the result they were made from.
  useEffect(() => {
    const urls = createBlobUrls(data?.media ?? [])
    setBlobUrls(urls)
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
  }, [data])

  const srcFor = useCallback(
    (url?: string) => resolveMediaSrc(url, { hasParent, data, blobUrls }),
    [hasParent, data, blobUrls]
  )

  // A ComponentsProvider does not inherit from an outer one, so the scoped provider that adds
  // the resolver is handed the app's component definitions again.
  const components = useComponents()

  const value = useMemo<MetadataVerificationContextValue>(
    () => ({
      enabled,
      pending: enabled && isPending,
      failed: isError,
      data,
      gate: voteGate({ enabled, pending: enabled && isPending, failed: isError, data }),
      srcFor,
    }),
    [enabled, isPending, isError, data, srcFor]
  )

  return (
    <MetadataVerificationContext.Provider value={value}>
      {/* srcFor changes identity only with the verification result and the blob cache, so the
          components re-render exactly when an image's resolution can change. */}
      <ComponentsProvider components={components} resolveMediaUrl={srcFor}>
        {children}
      </ComponentsProvider>
    </MetadataVerificationContext.Provider>
  )
}
