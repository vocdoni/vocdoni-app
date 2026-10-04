import { Alert, Box, Flex } from '@chakra-ui/react'
import { ReactNode } from 'react'

type BannerProps = {
  status: 'info' | 'warning' | 'error' | 'success'
  children: ReactNode
  action?: ReactNode
}

/** A one-line alert with its action on the right (below it on phones). */
export const Banner = ({ status, children, action }: BannerProps) => (
  <Alert.Root status={status}>
    <Alert.Indicator />
    <Flex flex='1' direction={{ base: 'column', md: 'row' }} align={{ base: 'flex-start', md: 'center' }} gap={3}>
      <Alert.Description flex='1' fontSize='sm'>
        {children}
      </Alert.Description>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Flex>
  </Alert.Root>
)
