import { AlertRoot as Alert, AlertDescription, AlertIndicator, AlertTitle, Box, type BoxProps } from '@chakra-ui/react'

type ListStateAlertProps = {
  show?: boolean
  status?: 'info' | 'error'
  title: string
  description?: string
  mb?: BoxProps['mb']
}

export const ListStateAlert = ({
  show = false,
  status = 'info',
  title,
  description,
  mb = '4',
}: ListStateAlertProps) => {
  if (!show) return null

  return (
    <Box mb={mb}>
      <Alert status={status}>
        <AlertIndicator />
        <Box>
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </Box>
      </Alert>
    </Box>
  )
}
