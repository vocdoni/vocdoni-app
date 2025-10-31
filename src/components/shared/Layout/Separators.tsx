import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { Trans } from 'react-i18next'

export const HSeparator = (props: { variant?: string; [x: string]: any }) => {
  const { variant, ...rest } = props
  return <Flex h='px' w='full' bg='rgba(135, 140, 189, 0.3)' {...rest} />
}

export const OrSeparator = (props: FlexProps) => (
  <Flex align='center' mb={4} {...props}>
    <HSeparator />
    <Text color='gray.500' fontWeight='bold' mx={3.5} whiteSpace='nowrap' size='xs' textTransform='uppercase'>
      <Trans i18nKey='or_continue_with'>or continue with</Trans>
    </Text>
    <HSeparator />
  </Flex>
)
