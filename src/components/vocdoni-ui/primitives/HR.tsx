import { Box, type BoxProps } from '@chakra-ui/react'

export type HRProps = BoxProps & { variant?: string }

export const HR = (props: HRProps) => (
  <Box as='hr' width='100%' height='1px' bg='chakra.body.bg' opacity={0.2} my={4} {...props} />
)
