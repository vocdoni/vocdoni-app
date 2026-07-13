import { Button, Card } from '@chakra-ui/react'
import { useClient, useOrganization } from '@vocdoni/react-components'
import { areEqualHexStrings } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { EmptyState } from '~components/ui/EmptyState'
import { Routes } from '~src/router/routes'
import { generatePath } from 'react-router-dom'
import empty from '/assets/illustrations/2.png'

const NoElections = () => {
  const { t } = useTranslation()
  const { account } = useClient()
  const { organization } = useOrganization()
  const isOwner = areEqualHexStrings(account?.address, organization?.address)

  return (
    <Card.Root variant='no-elections' minH='100%'>
      <Card.Body>
        <EmptyState
          image={empty}
          imageAlt={t('organization.elections_list_empty.alt')}
          title={
            isOwner ? t('organization.elections_list_empty.title') : t('organization.elections_list_empty.not_owner')
          }
          description={isOwner ? t('organization.elections_list_empty.description') : undefined}
        >
          {isOwner && (
            <Button mt={4} w='100%' asChild>
              <RouterAwareLink to={generatePath(Routes.processes.create)}>{t('menu.create')}</RouterAwareLink>
            </Button>
          )}
        </EmptyState>
      </Card.Body>
    </Card.Root>
  )
}

export default NoElections
