import { Box, Link } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
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
  'unsupported',
  'results',
])

/** Whether a screen shows the legal notice under its content. */
export const showsLegalNotice = (kind: VoterScreenKind): boolean => LEGAL_NOTICE_SCREENS.has(kind)

/**
 * "Per garantir un vot segur, …, fa servir la plataforma Vocdoni …": in the voter's note style (14px in the quiet
 * ink), aligned with the column. Nothing for an organisation with no name. The link opens in a new tab.
 */
const VoterLegalNotice = ({ orgName }: { orgName: string }) => {
  if (!orgName) return null
  return (
    <Box as='p' data-testid='layout-legal-notice' mt='8' textStyle='body' color='fg.subtle'>
      <Trans
        i18nKey='layout.legal_notice'
        values={{ orgName }}
        components={{ strong: <Box as='strong' color='fg' fontWeight='semibold' /> }}
      />{' '}
      <Link href='https://vocdoni.io/' target='_blank' rel='noopener noreferrer'>
        vocdoni.io
      </Link>
      .
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
          ? {
              title: textOf(election.title as Parameters<typeof textOf>[0]),
              // The head keeps the open-until line while the vote is paused: the notice and the note say it (D-20).
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
      {showsLegalNotice(screen.kind) && <VoterLegalNotice orgName={brand.name} />}
    </VoterShell>
  )
}
