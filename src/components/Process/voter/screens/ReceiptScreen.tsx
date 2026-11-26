import { Alert, Box } from '@chakra-ui/react'
import { useReactComponentsLocalize } from '@vocdoni/react-components'
import { Trans, useTranslation } from 'react-i18next'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { useVoterFlow } from '../flow-context'
import { ReceiptCard } from '../parts/ReceiptCard'
import { NoticeCard, ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'
import { ShowResultsButton } from '../parts/ShowResultsButton'
import { VoterActionBar } from '../parts/VoterActionBar'

/**
 * Receipt (board V4VoterWide 10, without the voter's name): the vote landed, its codes, and when the results come.
 * Each code links to the same per-vote verify URL the old success dialog built (ruling R7). An anonymous census cannot
 * show the receipt again (audit F6, board V4VoterWideMore 12): the help no longer says the page can be closed, a
 * warning says to keep the codes now, and the card offers to copy or download them.
 */
export const ReceiptScreen = () => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, voteIds, anonymous, moved, statuses } = useVoterFlow()
  const hasCodes = election.questions.some((question) => voteIds[question.id])
  // Only what the chain confirmed is "in the record" (gate F3): a question signed elsewhere and not confirmable is
  // said apart, in the SDK's sentence.
  const recorded = election.questions.filter(
    (question, index) => statuses[index] === 'confirmed' || !!voteIds[question.id]
  ).length
  const keepCodes = anonymous && hasCodes
  // `unconfirmed` wins over `signed`, as on the already-voted screen: a vote the chain does not hold is said as such.
  const locked = statuses.includes('unconfirmed') ? 'unconfirmed' : statuses.includes('signed') ? 'signed' : undefined

  return (
    <VoterScreenFrame kind='receipt' privateContent>
      {/* data-testid: the e2e cast helper waits for this, as it did for the old success dialog. */}
      <Box data-testid='vote-receipt'>
        <SuccessDisc />
        <ScreenHeading focus={moved} mt='5'>
          {t('voter.receipt.title')}
        </ScreenHeading>
        <ScreenHelp>
          {keepCodes
            ? t('voter.receipt.help_anonymous', { count: recorded })
            : t('voter.receipt.help', { count: recorded })}
        </ScreenHelp>
        {keepCodes && (
          <Alert.Root status='warning' layout='ballot' mt='5' role='status'>
            <Alert.Content>
              <Alert.Description>
                <Trans i18nKey='voter.receipt.anonymous_warning' components={{ strong: <strong /> }} />
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        <ReceiptCard anonymous={keepCodes} />
        {locked && (
          <NoticeCard
            title={locked === 'signed' ? localize('vote.disabled.signed') : localize('vote.disabled.unconfirmed')}
          />
        )}
      </Box>
      <VoterActionBar primary={<ShowResultsButton />} />
    </VoterScreenFrame>
  )
}
