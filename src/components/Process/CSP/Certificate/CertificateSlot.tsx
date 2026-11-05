import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { CertPhase } from './useCertificateAuth'

/**
 * Server render and hydration show both slots; the head script's flag on <html> hides the wrong one
 * before first paint. After mount the hook knows the phase and only `children` render.
 */
export const CertificateSlot = ({
  phase,
  idle,
  returning,
  children,
}: {
  phase: CertPhase
  idle: ReactNode
  returning: ReactNode
  children: ReactNode
}) =>
  phase.kind === 'ssr' ? (
    <>
      <Box data-cert-slot='idle'>{idle}</Box>
      <Box data-cert-slot='returning'>{returning}</Box>
    </>
  ) : (
    <>{children}</>
  )
