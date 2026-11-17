import { Box, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { useVoterFlow } from '../flow-context'
import { ReceiptCard } from '../parts/ReceiptCard'
import { ResultsLine } from '../parts/ResultsLine'
import { ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'

/**
 * Receipt (board V4VoterWide 10, without the voter's name): the vote landed, its codes, and when the results come.
 * Each code links to the same per-vote verify URL the old success dialog built (ruling R7). The anonymous census's
 * one-time warning stays here (audit F6).
 */
export const ReceiptScreen = () => {
  const { t } = useTranslation()
  const { election, voteIds, anonymous, moved } = useVoterFlow()
  const hasCodes = election.questions.some((question) => voteIds[question.id])

  return (
    <VoterScreenFrame kind='receipt' privateContent>
      {/* data-testid: the e2e cast helper waits for this, as it did for the old success dialog. */}
      <Box data-testid='vote-receipt'>
        <SuccessDisc />
        <ScreenHeading focus={moved} mt='5'>
          {t('voter.receipt.title')}
        </ScreenHeading>
        <ScreenHelp>{t('voter.receipt.help', { count: election.questions.length })}</ScreenHelp>
        <ReceiptCard />
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
