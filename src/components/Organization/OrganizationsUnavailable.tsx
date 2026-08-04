import { Button, Card, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { LuRefreshCw } from 'react-icons/lu'
import { useAuth } from '~components/Auth/useAuth'
import { DashboardContents } from '~components/Dashboard/Contents'
import { EmptyState } from '~components/ui/EmptyState'

/**
 * Shown when the organization address list could not be read. Deliberately
 * distinct from `NoOrganizations`: telling an org owner they have no
 * organizations because a request failed is worse than reporting the failure,
 * and there is nothing here to recover it on its own — the query sits at the
 * app root and never remounts.
 */
export const OrganizationsUnavailable = () => {
  const { refreshAddresses } = useAuth()
  const [isRetrying, setRetrying] = useState(false)

  const retry = async () => {
    setRetrying(true)
    try {
      await refreshAddresses()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <Flex flexDirection='column'>
      <Card.Root variant='no-elections' minH='100%' maxW='650' mx='auto'>
        <Card.Body>
          <EmptyState
            icon={LuRefreshCw}
            title={<Trans i18nKey='organization.unavailable_title'>We couldn't load your organizations</Trans>}
            description={
              <Trans i18nKey='organization.unavailable_description'>
                Something went wrong while reading your organizations. This is usually temporary — please try again.
              </Trans>
            }
          >
            <Button mt={4} onClick={retry} loading={isRetrying}>
              <Trans i18nKey='organization.unavailable_retry'>Try again</Trans>
            </Button>
          </EmptyState>
        </Card.Body>
      </Card.Root>
    </Flex>
  )
}

export const OrganizationsUnavailablePage = () => (
  <DashboardContents>
    <OrganizationsUnavailable />
  </DashboardContents>
)
