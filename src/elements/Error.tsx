import { Flex, Text } from '@chakra-ui/react'
import { ErrAccountNotFound, ErrAddressMalformed, ErrCantParseElectionID, ErrElectionNotFound } from '@vocdoni/sdk'
import { lazy } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteError } from 'react-router-dom'
import { RiErrorWarningLine } from 'react-icons/ri'

const NotFound = lazy(() => import('./NotFound'))

const Error = () => {
  const { t } = useTranslation()
  const error = useRouteError()

  if (
    error instanceof ErrElectionNotFound ||
    error instanceof ErrCantParseElectionID ||
    error instanceof ErrAddressMalformed ||
    error instanceof ErrAccountNotFound
  ) {
    return <NotFound />
  }

  return (
    <Flex
      flexDirection='column'
      gap={4}
      alignItems='center'
      mt={12}
      mb={44}
      px={{
        base: 10,
        sm: 14,
      }}
    >
      <RiErrorWarningLine />
      <Text>{t('error.loading_page')}</Text>
      <Text>{(error as Error).toString()}</Text>
    </Flex>
  )
}

export default Error
