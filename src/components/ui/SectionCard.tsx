import { Box, type BoxProps, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

export type SectionCardProps = BoxProps & { title?: ReactNode; action?: ReactNode }

/** A bordered card with an optional small heading and an action beside it. */
export const SectionCard = ({ title, action, children, ...props }: SectionCardProps) => (
  <Box border='1px solid' borderColor='border' borderRadius='md' p={4} bg='bg' minW={0} {...props}>
    {(title || action) && (
      <Box display='flex' justifyContent='space-between' alignItems='center' gap={3} mb={3}>
        {title && (
          <Text as='h2' fontSize='sm' fontWeight='bolder'>
            {title}
          </Text>
        )}
        {action}
      </Box>
    )}
    {children}
  </Box>
)
