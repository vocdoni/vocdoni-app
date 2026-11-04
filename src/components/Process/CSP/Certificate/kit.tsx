import { Box, Link, type BoxProps, type TextProps } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// Every Text gets an explicit size: the app's Text recipe forces 16px otherwise.
export const P = (props: TextProps) => <Text fontSize='md' lineHeight='1.5' {...props} />
export const Small = (props: TextProps) => <Text fontSize='sm' lineHeight='1.5' {...props} />
export const Tiny = (props: TextProps) => <Text fontSize='xs' lineHeight='1.5' {...props} />

/** Inline text link that reuses the app's Link recipe. */
export const TLink = ({ children, ...props }: { children: ReactNode } & React.ComponentProps<typeof Link>) => (
  <Link href='#' {...props}>
    {children}
  </Link>
)

/** Bordered panel used for every certificate-flow state. */
export const Panel = ({ tone = 'neutral', ...props }: BoxProps & { tone?: 'neutral' | 'error' | 'success' }) => (
  <Box
    border='1px solid'
    borderColor={tone === 'error' ? 'border.error' : tone === 'success' ? 'border.success' : 'border'}
    borderRadius='lg'
    p={{ base: 4, md: 6 }}
    bg='bg'
    {...props}
  />
)
