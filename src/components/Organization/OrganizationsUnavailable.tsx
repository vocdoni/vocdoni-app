import { Button, Card, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { RefreshIcon } from '~theme/icons'
import { useAuth } from '~components/Auth/useAuth'
import { DashboardContents } from '~components/Dashboard/Contents'
import { EmptyState } from '~components/ui/EmptyState'

type OrganizationsUnavailableProps = {
  onRetry?: () => Promise<unknown>
}

/**
 * Shown when the organization address list could not be read, or when the active
 * organization itself could not be loaded (used by `OrganizationGate` with an `onRetry`).
 * Deliberately distinct from `NoOrganizations`: a request failure is not the same as
 * having no organizations, and the query never remounts on its own.
 */
export const OrganizationsUnavailable = ({ onRetry }: OrganizationsUnavailableProps = {}) => {
  const { refreshAddresses } = useAuth()
  const [isRetrying, setRetrying] = useState(false)

  const retry = async () => {
    setRetrying(true)
    try {
      await (onRetry ?? refreshAddresses)()
    } catch {
      // rejection stays on screen; the caller already shows the error state
    } finally {
      setRetrying(false)
    }
  }

  return (
    <Flex flexDirection='column'>
      <Card.Root variant='plain' minH='full' maxW='card.empty' mx='[auto]'>
        <Card.Body>
          <EmptyState
            icon={RefreshIcon}
            title={<Trans i18nKey='organization.unavailable_title'>We couldn't load your organizations</Trans>}
            description={
              <Trans i18nKey='organization.unavailable_description'>
                Something went wrong while reading your organizations. This is usually temporary — please try again.
              </Trans>
            }
          >
            <Button mt='4' onClick={retry} loading={isRetrying}>
              <Trans i18nKey='organization.unavailable_retry'>Try again</Trans>
            </Button>
          </EmptyState>
        </Card.Body>
      </Card.Root>
    </Flex>
  )
}

export const OrganizationsUnavailablePage = ({ onRetry }: OrganizationsUnavailableProps = {}) => (
  <DashboardContents>
    <OrganizationsUnavailable onRetry={onRetry} />
  </DashboardContents>
)
