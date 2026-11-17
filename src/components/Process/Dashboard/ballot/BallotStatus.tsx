import { Box, Card, chakra, Icon, Link, useSlotRecipe } from '@chakra-ui/react'
import { isBeforeStart } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { useActions } from '~components/Actions/ActionsContext'
import { ChevronRightIcon, LockIcon } from '~theme/icons'
import { canCancelVote } from '~utils/vote-state'
import type { SummaryModel } from '../summary/use-summary-model'
import { useCloneAsDraft } from '../use-clone-as-draft'

/**
 * "The ballot can no longer be changed": the questions are fixed once the vote is published. For whoever manages the
 * vote, the way to correct a mistake: cancel it (while it can still be canceled) and duplicate it.
 */
export const BallotStatus = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const { canManage } = useActions()
  const { cloneAsDraft, isCloning } = useCloneAsDraft()
  const styles = useSlotRecipe({ key: 'ballotPaper' })()
  const { election, state, now } = model
  // A draft can still be edited, so it is not locked.
  if (state === 'draft') return null

  const opened = !isBeforeStart(election.startDate, now)
  const cancelable = canCancelVote(election, state)

  let fixNote: string
  if (cancelable)
    fixNote = desktop
      ? t('votes.ballot.fix.cancel_and_duplicate', {
          defaultValue: 'Cancel the vote and duplicate it to correct it.',
        })
      : t('votes.ballot.fix.cancel_and_duplicate_short', { defaultValue: 'Cancel the vote and duplicate it.' })
  else
    fixNote = desktop
      ? t('votes.ballot.fix.duplicate', { defaultValue: 'Duplicate it to correct it in a new vote.' })
      : t('votes.ballot.fix.duplicate_short', { defaultValue: 'Duplicate it to correct it.' })

  return (
    <Card.Root
      variant='frame'
      as='section'
      aria-label={t('votes.ballot.status_label', { defaultValue: 'Ballot status' })}
    >
      <Card.Body flexDirection='row' alignItems='flex-start' gap='3' py={{ base: '3.5', lg: '4' }}>
        <Box css={styles.tile} aria-hidden>
          <Icon as={LockIcon} boxSize='icon.chevron' />
        </Box>
        <Box css={styles.statement}>
          <chakra.p css={styles.statementTitle}>
            {t('votes.ballot.locked.title', { defaultValue: 'The ballot can no longer be changed' })}
          </chakra.p>
          <chakra.p css={styles.statementText}>
            {opened
              ? t('votes.ballot.locked.opened', {
                  defaultValue:
                    'Since the vote opened, the questions and the options are fixed. Everyone votes on the same text.',
                })
              : t('votes.ballot.locked.published', {
                  defaultValue:
                    'Since the vote was published, the questions and the options are fixed. Everyone will vote on the same text.',
                })}
          </chakra.p>
        </Box>
      </Card.Body>
      {canManage && (
        <Card.Body
          flexDirection='row'
          alignItems='center'
          gap='3'
          minH={{ base: '14', lg: 'auto' }}
          py={{ base: '1.5', lg: '3' }}
        >
          <Box css={styles.statement}>
            <chakra.span css={styles.statementTitle}>
              {t('votes.ballot.fix.title', { defaultValue: 'Spotted a mistake?' })}
            </chakra.span>
            <chakra.span css={styles.statementNote}>{fixNote}</chakra.span>
          </Box>
          <Link asChild variant='row-action'>
            <button type='button' disabled={isCloning} onClick={() => void cloneAsDraft(election)}>
              {t('votes.page.duplicate', { defaultValue: 'Duplicate' })}
              <Icon as={ChevronRightIcon} boxSize={{ base: '3.5', lg: 'icon.xs' }} />
            </button>
          </Link>
        </Card.Body>
      )}
    </Card.Root>
  )
}
