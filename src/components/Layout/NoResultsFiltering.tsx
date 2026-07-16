import { Card } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '~components/ui/EmptyState'
import empty from '/assets/illustrations/2.png'

export const NoResultsFiltering = () => {
  const { t } = useTranslation()

  return (
    <Card.Root variant='no-elections' minH='100%' maxW='650' m='80px auto'>
      <Card.Body>
        <EmptyState
          image={empty}
          title={t('no_results_filtering', { defaultValue: 'Your current search filter returns no results' })}
        />
      </Card.Body>
    </Card.Root>
  )
}
