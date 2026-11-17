import { useBreakpointValue } from '@chakra-ui/react'

type Options = {
  /**
   * On (the default), the first render resolves `base`, as the server does, so a server-rendered page hydrates without a
   * mismatch. A client-only page (the dashboard) passes `false` and reads the screen on its first render.
   */
  ssr?: boolean
}

// Below `md`.
export const useIsMobile = ({ ssr = true }: Options = {}) => useBreakpointValue({ base: true, md: false }, { ssr })

// From `lg`, a desktop: where a hardware keyboard and a pointer are the norm (labelled menu buttons).
export const useIsDesktop = ({ ssr = true }: Options = {}) => !!useBreakpointValue({ base: false, lg: true }, { ssr })
