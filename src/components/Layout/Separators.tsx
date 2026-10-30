import { Flex, FlexProps, Separator, Text } from '@chakra-ui/react'
import { Trans } from 'react-i18next'

// A hairline on each side of a short uppercase label, splitting a form or a list of options in two.
export const LabelledSeparator = ({ children, ...props }: FlexProps) => (
  <Flex align='center' {...props}>
    <Separator w='full' borderColor='separator' />
    <Text color='fg.muted' fontWeight='bold' mx='3.5' whiteSpace='nowrap' textStyle='caption' textTransform='uppercase'>
      {children}
    </Text>
    <Separator w='full' borderColor='separator' />
  </Flex>
)

export const OrSeparator = (props: FlexProps) => (
  <LabelledSeparator mb='4' {...props}>
    <Trans i18nKey='or_continue_with'>or continue with</Trans>
  </LabelledSeparator>
)
