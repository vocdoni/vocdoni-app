import { AlertRoot as Alert, AlertDescription, AlertIndicator, AlertTitle, Box, type BoxProps } from '@chakra-ui/react'

type ListStateAlertProps = {
  error: unknown
  // Defaults to whether there is an error; lists that hide it while loading pass their own.
  show?: boolean
  title: string
  // Description for an error that is not an `Error`, so it carries no message of its own.
  fallback?: string
  mb?: BoxProps['mb']
}

// A list or block that failed to load: the title says what, the description is the error's own message.
export const ListStateAlert = ({ error, show = !!error, title, fallback, mb = '4' }: ListStateAlertProps) => {
  if (!show) return null

  const description = error instanceof Error ? error.message : fallback

  return (
    <Box mb={mb}>
      <Alert status='error'>
        <AlertIndicator />
        <Box>
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </Box>
      </Alert>
    </Box>
  )
}
