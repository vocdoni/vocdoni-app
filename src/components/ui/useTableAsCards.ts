import { useBreakpointValue } from '@chakra-ui/react'

// Below `md`, lists that are tables on wider screens render as a stack of `list-item` cards instead.
export const useTableAsCards = () => useBreakpointValue({ base: true, md: false })
