import { useElection } from '@vocdoni/react-components'
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createBlobUrls, resolveMediaSrc, voteGate, type VoteGate } from './gate'
import { useMetadataVerification } from './useMetadataVerification'
import type { ProcessVerification } from './verify'

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
 */
export const MetadataVerificationProvider = ({ children }: PropsWithChildren) => {
  const { election } = useElection()
  const { enabled, data, isPending, isError } = useMetadataVerification()
  const hasParent = !!(election as { upstreamId?: string } | null)?.upstreamId
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

  return <MetadataVerificationContext.Provider value={value}>{children}</MetadataVerificationContext.Provider>
}

/**
 * The resolver shape `@vocdoni/react-components` takes as `<ComponentsProvider resolveMediaUrl>`
 * (vocdoni/vocdoni-integrator-sdk#82): a blob URL for verified bytes, the URL unchanged for
 * media nothing commits, undefined while not ready.
 */
export type MediaUrlResolver = (url: string) => string | undefined

/**
 * {@link MediaUrlResolver} backed by the verified images, for the components that render media
 * themselves. Its identity changes only with the blob cache, so components re-render then.
 */
export const useMediaUrlResolver = (): MediaUrlResolver => {
  const context = useMetadataVerificationContext()
  const srcFor = context?.srcFor
  return useCallback((url: string) => (srcFor ? srcFor(url) : url), [srcFor])
}

/** The `src` to render an image from: its verified bytes on the voter page, the URL elsewhere. */
export const useVerifiedMediaSrc = (url?: string) => {
  const context = useMetadataVerificationContext()
  return context ? context.srcFor(url) : url
}
