import { Flex, FlexProps, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ErrorIcon } from '~theme/icons'

const ErrorComponent = ({ error, ...props }: { error: Error | string } & FlexProps) => {
  const { t } = useTranslation()

  return (
    <Flex
      flexDirection='column'
      gap='4'
      alignItems='center'
      mt='12'
      mb='44'
      px={{
        base: '10',
        sm: '14',
      }}
      {...props}
    >
      <ErrorIcon />
      <Text>{t('error.loading_page')}</Text>
      <Text>{error.toString()}</Text>
    </Flex>
  )
}

export default ErrorComponent
