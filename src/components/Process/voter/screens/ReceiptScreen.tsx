import { Box, Text } from '@chakra-ui/react'
import { useReactComponentsLocalize } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { useVoterFlow } from '../flow-context'
import { ReceiptCard } from '../parts/ReceiptCard'
import { ResultsLine } from '../parts/ResultsLine'
import { NoticeCard, ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'

/**
 * Receipt (board V4VoterWide 10, without the voter's name): the vote landed, its codes, and when the results come.
 * Each code links to the same per-vote verify URL the old success dialog built (ruling R7). The anonymous census's
 * one-time warning stays here (audit F6).
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
  const locked = statuses.find((status) => status === 'unconfirmed' || status === 'signed')

  return (
    <VoterScreenFrame kind='receipt' privateContent>
      {/* data-testid: the e2e cast helper waits for this, as it did for the old success dialog. */}
      <Box data-testid='vote-receipt'>
        <SuccessDisc />
        <ScreenHeading focus={moved} mt='5'>
          {t('voter.receipt.title')}
        </ScreenHeading>
        <ScreenHelp>{t('voter.receipt.help', { count: recorded })}</ScreenHelp>
        <ReceiptCard />
        {locked && (
          <NoticeCard
            title={locked === 'signed' ? localize('vote.disabled.signed') : localize('vote.disabled.unconfirmed')}
          />
        )}
        {anonymous && hasCodes && (
          <Text as='p' textStyle='ballot-hint' fontWeight='semibold' mt='3.5'>
            {t('vote.anonymous_receipt')}
          </Text>
        )}
        <ResultsLine />
      </Box>
    </VoterScreenFrame>
  )
}
