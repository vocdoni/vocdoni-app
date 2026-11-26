import { Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { StaticLegalNotice } from '~components/Layout/LegalNotice'
import { StepProgress } from '~components/ui/StepProgress'
import { VoterShell, type VoterShellColumn } from '~components/ui/VoterShell'
import { useVoterFlow } from './flow-context'
import { textOf } from './format'
import { VoterLegalLinks } from './parts/VoterActionBar'
import { VoterBrandLogo } from './parts/VoterBrandLogo'
import { VoterRail } from './parts/VoterRail'
import { VoterTopActions } from './parts/VoterTopActions'
import { VoteStatusLine } from './parts/VoteStatusLine'
import { CodeScreen } from './screens/CodeScreen'
import { IdentifyScreen } from './screens/IdentifyScreen'
import { QuestionScreen } from './screens/QuestionScreen'
import { ReceiptScreen } from './screens/ReceiptScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { RoomScreen } from './screens/RoomScreen'
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
  UpcomingScreen,
} from './screens/StateScreens'
import { VerifyReceiptScreen } from './screens/VerifyReceiptScreen'
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
  verifyReceipt: 'narrow',
  results: 'results',
}

// The hidden results are a status screen (560px, board M9); the figures take the results column (640px, M10, M11).
const columnOf = (screen: VoterScreen): VoterShellColumn =>
  screen.kind === 'results' && screen.state === 'hidden' ? 'status' : (COLUMN[screen.kind] ?? 'status')

const Screen = ({ screen }: { screen: VoterScreen }) => {
  switch (screen.kind) {
    case 'identify':
      return <IdentifyScreen notice={screen.notice} />
    case 'code':
      return <CodeScreen />
    case 'checking':
      return <CheckingScreen />
    case 'unavailable':
      return <UnavailableScreen refused={screen.refused} />
    case 'room':
      return <RoomScreen />
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
    case 'verifyReceipt':
      return <VerifyReceiptScreen />
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

// The screens that carry the legal notice: identification, the welcome and the state screens. The ballot, the sending
// and the receipt stay clear of it (controller ruling on the conformance pass's Q2).
const LEGAL_NOTICE_SCREENS: ReadonlySet<VoterScreenKind> = new Set<VoterScreenKind>([
  'identify',
  'welcome',
  'alreadyVoted',
  'upcoming',
  'closed',
  'paused',
  'canceled',
  'notEligible',
  'unavailable',
  'room',
  'results',
])

/** Whether a screen shows the legal notice under its content. */
export const showsLegalNotice = (kind: VoterScreenKind): boolean => LEGAL_NOTICE_SCREENS.has(kind)

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
          ? {
              title: textOf(election.title as Parameters<typeof textOf>[0]),
              status: <VoteStatusLine context='head' />,
            }
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
      column={columnOf(screen)}
      credit={{ text: t('voter.credit.text'), brand: t('voter.credit.brand'), links: <VoterLegalLinks /> }}
    >
      <Screen screen={screen} />
      {showsLegalNotice(screen.kind) && <StaticLegalNotice orgName={brand.name} variant='voter' />}
    </VoterShell>
  )
}
