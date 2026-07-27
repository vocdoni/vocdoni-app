import { Box, Card, Text } from '@chakra-ui/react'
import {
  ElectionDescription,
  ElectionProvider,
  ElectionStatusBadge,
  ElectionTitle,
  useElection,
} from '@vocdoni/react-components'
import { processVoteCount } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'
import { RouterAwareLink } from '~components/RouterAwareLink'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { ManageProcessLink } from './ManageProcessLink'
import { ProcessDateInline } from './Date'

interface Props {
  election: VotingProcessResponse
}

const ProcessCardDetailed = ({ election }: Props) => {
  return (
    <ElectionProvider id={election.id}>
      <Card.Root>
        <Card.Body>
          <ProcessCardLink election={election}>
            <ProcessDetailedCardTitle />
            <Box>
              <ElectionStatusBadge />
              <ProcessDetailedCreationDate />
            </Box>
          </ProcessCardLink>
          <ProcessDetailedCardDescription />
          <ManageProcessLink />
        </Card.Body>

        <Card.Footer>
          <ProcessDetailedCardFooter />
        </Card.Footer>
      </Card.Root>
    </ElectionProvider>
  )
}

const ProcessCardLink = ({ children, election }: PropsWithChildren<{ election: VotingProcessResponse }>) => {
  const language = usePublicLanguage()

  if (!election?.id) {
    return <>{children}</>
  }

  const publicProcessPath = getPublicProcessPath({
    id: election.id,
    language,
  })

  return <RouterAwareLink to={publicProcessPath}>{children}</RouterAwareLink>
}

export default ProcessCardDetailed

const ProcessDetailedCreationDate = () => {
  // Creation time is not available in the new Election type; omit this field.
  return null
}

const ProcessDetailedCardTitle = () => {
  const { election } = useElection()
  const { t } = useTranslation()

  if (!election) {
    return (
      <Text fontStyle='italic' color='error'>
        {t('process.is_invalid')}
      </Text>
    )
  }

  return <ElectionTitle as='p' />
}

const ProcessDetailedCardDescription = () => {
  const { election, status } = useElection()
  const { t } = useTranslation()
  const { ReadMoreMarkdownWrapper } = useReadMoreMarkdown(100)

  if (!election) {
    return null
  }

  return (
    <>
      {status !== 'CANCELED' ? (
        <ReadMoreMarkdownWrapper>
          <ElectionDescription />
        </ReadMoreMarkdownWrapper>
      ) : (
        <Box>
          <Text>{t('process.status.canceled')}</Text>
        </Box>
      )}
    </>
  )
}

const ProcessDetailedCardFooter = () => {
  const { t } = useTranslation()
  const { election, status, results } = useElection()

  if (!election) {
    return null
  }

  if (status === 'CANCELED') return null

  return (
    <Box>
      <Box>
        <ProcessDateInline />
      </Box>
      <Box>
        <Text>{t('process.voters')}</Text>
        <Text>{processVoteCount(results)}</Text>
      </Box>
    </Box>
  )
}
