import { useBreakpointValue } from '@chakra-ui/react'

// Below `md`. Until it mounts (and on the server) it resolves `base`, so the first render is the mobile one.
export const useIsMobile = () => useBreakpointValue({ base: true, md: false })

// From `lg`, a desktop: where a hardware keyboard and a pointer are the norm (labelled menu buttons).
export const useIsDesktop = () => !!useBreakpointValue({ base: false, lg: true })
