import { useBreakpointValue } from '@chakra-ui/react'

// Below `md`. Until it mounts (and on the server) it resolves `base`, so the first render is the mobile one.
export const useIsMobile = () => useBreakpointValue({ base: true, md: false })
