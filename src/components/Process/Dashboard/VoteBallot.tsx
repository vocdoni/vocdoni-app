import { Card, Text } from '@chakra-ui/react'
import { ElectionDescription, ElectionQuestions, useElection } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'

/** Papereta: the description and the questions as voters read them. */
export const VoteBallot = () => {
  const { t } = useTranslation()
  const { election } = useElection()

  // The questions render through the ballot type, which cannot be inferred for some legacy processes:
  // the section degrades on its own instead of taking the page down.
  const fallback = (
    <Text color='fg.muted'>{t('error.loading_section', { defaultValue: 'This section could not be loaded' })}</Text>
  )

  return (
    <Card.Root variant='section'>
      <ElectionDescription color='fg.muted' mb='6' />
      <ErrorBoundary fallback={fallback} resetKeys={[election]}>
        <ElectionQuestions />
      </ErrorBoundary>
    </Card.Root>
  )
}
