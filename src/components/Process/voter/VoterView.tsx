import { Box, Link } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { StaticLegalNotice } from '~components/Layout/LegalNotice'
import { StepProgress } from '~components/ui/StepProgress'
import { VoterShell, type VoterShellColumn } from '~components/ui/VoterShell'
import { useAppEnv } from '~src/app-env'
import { useVoterFlow } from './flow-context'
import { textOf } from './format'
import { VoterBrandLogo } from './parts/VoterBrandLogo'
import { VoterRail } from './parts/VoterRail'
import { VoterTopActions } from './parts/VoterTopActions'
import { VoteStatusLine } from './parts/VoteStatusLine'
import { CodeScreen } from './screens/CodeScreen'
import { IdentifyScreen } from './screens/IdentifyScreen'
import { QuestionScreen } from './screens/QuestionScreen'
import { ReceiptScreen } from './screens/ReceiptScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { SendingScreen } from './screens/SendingScreen'
import {
  AlreadyVotedScreen,
  CanceledScreen,
  CheckingScreen,
  ClosedScreen,
  NotEligibleScreen,
  PausedScreen,
  UnavailableScreen,
  UnsupportedScreen,
  UpcomingScreen,
} from './screens/StateScreens'
import { WelcomeScreen } from './screens/WelcomeScreen'
import type { VoterScreen, VoterScreenKind } from './voter-flow'

// The column's width from `lg` per screen, as the boards set it (conformance.md 1.0.2); the rest are 560px.
const COLUMN: Partial<Record<VoterScreenKind, VoterShellColumn>> = {
  identify: 'narrow',
  code: 'code',
  question: 'rail',
  review: 'rail',
  sending: 'sending',
  receipt: 'rail',
  results: 'results',
}

const Screen = ({ screen }: { screen: VoterScreen }) => {
  switch (screen.kind) {
    case 'identify':
      return <IdentifyScreen notice={screen.notice} />
    case 'code':
      return <CodeScreen />
    case 'checking':
      return <CheckingScreen />
    case 'unavailable':
      return <UnavailableScreen />
    case 'unsupported':
      return <UnsupportedScreen />
    case 'welcome':
      return <WelcomeScreen />
    case 'question':
      return <QuestionScreen key={screen.index} index={screen.index} paused={screen.paused} />
    case 'review':
      return <ReviewScreen paused={screen.paused} />
    case 'sending':
      return <SendingScreen />
    case 'receipt':
      return <ReceiptScreen />
    case 'alreadyVoted':
      return <AlreadyVotedScreen />
    case 'upcoming':
      return <UpcomingScreen />
    case 'closed':
      return <ClosedScreen />
    case 'paused':
      return <PausedScreen />
    case 'canceled':
      return <CanceledScreen />
    case 'notEligible':
      return <NotEligibleScreen />
    case 'results':
      return <ResultsScreen state={screen.state} />
  }
}

/**
 * The terms and privacy links today's footer carries (owner ruling R18), at the end of the column, right above the
 * credit: the shell's foot takes the credit only, and the phone's action bar covers it.
 */
const VoterLegalLinks = () => {
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = useAppEnv()
  return (
    <Box as='p' mt='4' textStyle='caption' color='fg.subtle' textAlign='center'>
      <Trans
        i18nKey='footer.terms_and_privacy'
        components={{
          link1: <Link href={TERMS_OF_SERVICE_URL} target='_blank' rel='noopener noreferrer' tone='muted' />,
          link2: <Link href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer' tone='muted' />,
        }}
      />
    </Box>
  )
}

/**
 * The voter page: the shell stays mounted and only the main column changes (spec D4 "Accessibility and feel"). The
 * strip, the progress line and the agenda show on the ballot's screens only. The logo (or the Vocdoni symbol) is not
 * a link (owner ruling R18).
 */
export const VoterView = ({ publicLanguageLinks }: { publicLanguageLinks?: Record<string, string> }) => {
  const { t } = useTranslation()
  const { screen, election, brand } = useVoterFlow()
  const ballot = screen.kind === 'question' || screen.kind === 'review'
  const total = election.questions.length
  const reached = screen.kind === 'question' ? screen.index + 1 : total
  const label =
    screen.kind === 'question'
      ? t('voter.progress.question', { current: screen.index + 1, total })
      : t('voter.progress.review')

  return (
    <VoterShell
      name={brand.name}
      logo={brand.logo ? <VoterBrandLogo src={brand.logo} name={brand.name} /> : undefined}
      actions={<VoterTopActions publicLanguageLinks={publicLanguageLinks} />}
      head={
        ballot
          ? { title: textOf(election.title as Parameters<typeof textOf>[0]), status: <VoteStatusLine /> }
          : undefined
      }
      progress={ballot ? <StepProgress label={label} value={reached} total={total} /> : undefined}
      rail={
        ballot ? (
          // The agenda carries the voter's answers: kept out of session replays (audit F13).
          <Box className='ph-no-capture'>
            <VoterRail />
          </Box>
        ) : undefined
      }
      railLabel={t('voter.agenda')}
      column={COLUMN[screen.kind] ?? 'status'}
      credit={{ text: t('voter.credit.text'), brand: t('voter.credit.brand') }}
    >
      <Screen screen={screen} />
      <StaticLegalNotice orgName={brand.name} />
      <VoterLegalLinks />
    </VoterShell>
  )
}
