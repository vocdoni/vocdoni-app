import { Box, Card, Center, Heading, Stack, Text } from '@chakra-ui/react'
import { PropsWithChildren, ReactNode } from 'react'

type AuthLayoutProps = PropsWithChildren<{
  title: string
  subtitle?: ReactNode
  footer?: ReactNode
}>

export const AuthLayout = ({ title, subtitle, footer, children }: AuthLayoutProps) => (
  <Center minH='100dvh' bg='bg.subtle' px={4} py={10}>
    <Stack gap={6} w='full' maxW='md'>
      <Stack gap={1} textAlign='center'>
        <Heading size='2xl' color='blue.fg'>
          Vocdoni Integrator
        </Heading>
        <Text color='fg.muted' fontSize='sm'>
          Developer portal
        </Text>
      </Stack>
      <Card.Root>
        <Card.Header>
          <Heading size='lg'>{title}</Heading>
          {subtitle && (
            <Text color='fg.muted' fontSize='sm' mt={1}>
              {subtitle}
            </Text>
          )}
        </Card.Header>
        <Card.Body>{children}</Card.Body>
        {footer && (
          <Card.Footer>
            <Box w='full' textAlign='center' fontSize='sm' color='fg.muted'>
              {footer}
            </Box>
          </Card.Footer>
        )}
      </Card.Root>
    </Stack>
  </Center>
)
