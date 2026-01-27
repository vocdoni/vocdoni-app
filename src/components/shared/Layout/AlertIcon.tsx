import { AlertIndicator, type HTMLChakraProps } from '@chakra-ui/react'

export const AlertIcon = (props: HTMLChakraProps<'span'>) => (
  <AlertIndicator {...props} className={['chakra-alert__icon', props.className].filter(Boolean).join(' ')} />
)
