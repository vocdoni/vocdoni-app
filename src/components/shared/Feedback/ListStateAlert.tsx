import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from '@chakra-ui/react'

type ListStateAlertProps = {
  show?: boolean
  status?: 'info' | 'error'
  title: string
  description?: string
  mb?: number | string
}

export const ListStateAlert = ({
  show = false,
  status = 'info',
  title,
  description,
  mb = 4,
}: ListStateAlertProps) => {
  if (!show) return null

  return (
    <Box mb={mb}>
      <Alert status={status}>
        <AlertIcon />
        <Box>
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </Box>
      </Alert>
    </Box>
  )
}
