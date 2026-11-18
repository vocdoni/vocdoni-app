import { Alert, Box, Button, Spinner, Status, Text, VisuallyHidden } from '@chakra-ui/react'
import { resolveEndDate } from '@vocdoni/api-client'
import { useReactComponentsLocalize } from '@vocdoni/react-components'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SuccessDisc } from '~components/ui/SuccessDisc'
import { useAppEnv } from '~src/app-env'
import { useVoterFlow } from '../flow-context'
import { formatVoteDay, formatVoteTime, textOf, voterTurnout, type Turnout } from '../format'
import { ReceiptCard } from '../parts/ReceiptCard'
import { ResultsLine } from '../parts/ResultsLine'
import {
  InlineAction,
  LocalText,
  NoticeCard,
  ScreenHeading,
  ScreenHelp,
  ScreenKicker,
  VoterScreenFrame,
} from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import type { VoterScreenKind } from '../voter-flow'

type CentredProps = {
  kind: VoterScreenKind
  kicker?: ReactNode
  /** Rendered before the heading (the success disc). */
  lead?: ReactNode
  /** The heading's top margin, when the board's differs from the default. */
  headingMt?: ComponentProps<typeof ScreenHeading>['mt']
  title: ReactNode
  body?: ReactNode
  children?: ReactNode
  privateContent?: boolean
}

/** The boards' centred pattern for a state (kicker or status line, title, sentence, an optional card or button). */
const Centred = ({ kind, kicker, lead, headingMt, title, body, children, privateContent }: CentredProps) => {
  const { moved } = useVoterFlow()
  return (
    <VoterScreenFrame kind={kind} privateContent={privateContent}>
      {lead}
      {kicker}
      <ScreenHeading focus={moved} mt={headingMt}>
        {title}
      </ScreenHeading>
      {body ? <ScreenHelp>{body}</ScreenHelp> : null}
      {children}
    </VoterScreenFrame>
  )
}

const useVoteTexts = () => {
  const { i18n } = useTranslation()
  const { election, brand } = useVoterFlow()
  const day = (date: Date, reference?: Date) => formatVoteDay(date, i18n.language, { reference })
  const time = (date: Date, zone = false) => formatVoteTime(date, i18n.language, { zone })
  return { title: textOf(election.title as Parameters<typeof textOf>[0]), organization: brand.name, day, time }
}

/** "Hi van votar 221 de 312 persones.": the count e2e reads, when the deployment shows counts. */
export const TurnoutLine = ({ turnout }: { turnout: Turnout }) => {
  const { t } = useTranslation()
  return (
    // data-testid: the count is interpolated in a plural sentence; the e2e observer reads the number from here.
    <Text as='span' data-testid='process-vote-count'>
      {turnout.total
        ? t('voter.closed.turnout', { count: turnout.count, total: turnout.total })
        : t('voter.closed.turnout_count', { count: turnout.count })}
    </Text>
  )
}

export const CheckingScreen = () => {
  const { t } = useTranslation()
  const labelId = useId()
  return (
    <VoterScreenFrame kind='checking'>
      {/* The status carries the name; the spinner is decoration (axe aria-prohibited-attr on a role-less label). */}
      <Box display='flex' justifyContent='center' py='16' role='status' aria-labelledby={labelId}>
        <Spinner size='lg' aria-hidden css={{ _motionReduce: { animationDuration: 'instant' } }} />
        <VisuallyHidden id={labelId}>{t('voter.checking')}</VisuallyHidden>
      </Box>
    </VoterScreenFrame>
  )
}

export const UnavailableScreen = () => {
  const { t } = useTranslation()
  return <Centred kind='unavailable' title={t('voter.unavailable.title')} body={t('voter.unavailable.body')} />
}

/** A vote held question by question: shown until the SDK can cast a subset of questions. */
export const UnsupportedScreen = () => {
  const { t } = useTranslation()
  return <Centred kind='unsupported' title={t('voter.unsupported.title')} body={t('voter.unsupported.body')} />
}

/** Board V4VoterWideLive 6: the dates with the time zone, so a wrong device clock shows (audit F18). */
export const UpcomingScreen = () => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  const { title, organization, day, time } = useVoteTexts()
  const start = election.startDate ? new Date(election.startDate) : undefined
  const end = resolveEndDate(election)
  return (
    <Centred
      kind='upcoming'
      kicker={organization ? <ScreenKicker>{organization}</ScreenKicker> : undefined}
      title={title}
      body={
        start && end ? (
          <LocalText>
            {t('voter.upcoming.sentence', {
              startDate: day(start),
              startTime: time(start, true),
              endDate: day(end, start),
              endTime: time(end, true),
            })}
          </LocalText>
        ) : undefined
      }
    >
      <NoticeCard title={t('voter.upcoming.card_title')}>{t('voter.upcoming.card_body')}</NoticeCard>
    </Centred>
  )
}

/**
 * What a cast that failed as the vote closed left on chain, in one true sentence (gate F6, gate-2 N2): nothing, some
 * questions (how many, with their codes), or not known (it may have landed: "Comprova el teu vot" asks again). Once
 * every question is on chain (a vote from another device, or one recovered at the end) nothing is said about it.
 */
const useFailedCast = () => {
  const { t } = useTranslation()
  const { election, state, chain } = useVoterFlow()
  const records = election.questions.map((_question, index) => chain[index] ?? 'missing')
  const total = records.length
  const recorded = records.filter((record) => record === 'recorded').length
  const unknown = records.filter((record) => record === 'unknown').length
  const failed = state.castError !== null && recorded < total
  let sentence = t('voter.closed.not_cast')
  if (unknown > 0) {
    sentence =
      recorded > 0 ? t('voter.closed.partly_unconfirmed', { count: recorded, total }) : t('voter.closed.unconfirmed')
  } else if (recorded > 0) {
    sentence = t('voter.closed.partly_cast', { count: recorded, total })
  }
  return {
    failed,
    unknown: failed && unknown > 0,
    sentence,
    receipt: state.castError !== null && recorded > 0,
  }
}

/**
 * Board V4VoterWideLive 8, with "Comprova el teu vot" (owner ruling). A cast that failed as the vote closed says what
 * it left on chain here (`useFailedCast`): the review that would show its error is gone, and nothing will be re-sent.
 */
export const ClosedScreen = () => {
  const { t } = useTranslation()
  const env = useAppEnv()
  const { election, facts, showResults, checkReceipt } = useVoterFlow()
  const { title, organization, day, time } = useVoteTexts()
  const end = resolveEndDate(election)
  const turnout = voterTurnout(election, env)
  const cast = useFailedCast()
  return (
    <Centred
      kind='closed'
      kicker={organization ? <ScreenKicker>{organization}</ScreenKicker> : undefined}
      title={title}
      body={
        <>
          {end ? <LocalText>{t('voter.closed.sentence', { date: day(end), time: time(end) })}</LocalText> : null}{' '}
          {turnout ? <TurnoutLine turnout={turnout} /> : null}
        </>
      }
    >
      {cast.failed && (
        <Alert.Root status={cast.unknown ? 'warning' : 'error'} layout='ballot' mt='6' role='alert'>
          <Alert.Content>
            <Alert.Description>{cast.sentence}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {cast.receipt && <ReceiptCard />}
      <VoterActionBar
        primary={
          <Button size='ballot' onClick={() => showResults(true)}>
            {t('voter.results.show')}
          </Button>
        }
        note={
          !facts.connected || cast.unknown ? (
            <InlineAction onClick={checkReceipt}>{t('voter.results.check_vote')}</InlineAction>
          ) : undefined
        }
      />
    </Centred>
  )
}

/** Board V4VoterWideMore 1: paused before the voter started; the page resumes by itself. */
export const PausedScreen = () => {
  const { t } = useTranslation()
  const { election } = useVoterFlow()
  const { title, day, time } = useVoteTexts()
  const end = resolveEndDate(election)
  return (
    <Centred
      kind='paused'
      headingMt='2.5'
      kicker={
        <Status.Root size='ballot' tone='warning'>
          <Status.Indicator />
          {t('voter.status.paused')}
        </Status.Root>
      }
      title={title}
      body={t('voter.paused.body')}
    >
      <NoticeCard title={t('voter.paused.card_title')}>
        {end ? <LocalText>{t('voter.paused.card_body', { date: day(end), time: time(end) })}</LocalText> : null}
      </NoticeCard>
    </Centred>
  )
}

/** Board V4VoterWideMore 3: nothing to do. */
export const CanceledScreen = () => {
  const { t } = useTranslation()
  const { title } = useVoteTexts()
  return (
    <Centred
      kind='canceled'
      headingMt='2.5'
      kicker={
        <Status.Root size='ballot' tone='danger'>
          <Status.Indicator />
          {t('voter.status.canceled')}
        </Status.Root>
      }
      title={title}
      body={t('voter.canceled.body')}
    >
      <NoticeCard title={t('voter.canceled.card_title')}>{t('voter.canceled.card_body')}</NoticeCard>
    </Centred>
  )
}

/** Board V4VoterWideMore 4: identified, not in this census. A different case from a failed match. */
export const NotEligibleScreen = () => {
  const { t } = useTranslation()
  const { signOut } = useVoterFlow()
  const { title, organization } = useVoteTexts()
  return (
    <Centred
      kind='notEligible'
      kicker={<ScreenKicker>{title}</ScreenKicker>}
      title={t('voter.not_eligible.title')}
      body={t('voter.not_eligible.body')}
    >
      <NoticeCard title={t('voter.not_eligible.card_title')}>
        {t('voter.not_eligible.card_body', { organization })}
      </NoticeCard>
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={signOut}>
            {t('voter.sign_out')}
          </Button>
        }
      />
    </Centred>
  )
}

/**
 * Board V4VoterWideLive 5 (the cast time is omitted: nothing feeds it): the receipt codes the SDK recovered, or why
 * there are none (an anonymous census in another tab, a vote signed but not confirmable from here). A vote the chain
 * does not hold (`unconfirmed`) gets no success mark and no "Ja has votat" (gate F3): the vote's title, the codes of
 * what did land, and the SDK's sentence about what did not.
 */
export const AlreadyVotedScreen = () => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, voteIds, anonymous, statuses } = useVoterFlow()
  const { title } = useVoteTexts()
  const hasCodes = election.questions.some((question) => voteIds[question.id])
  const locked = statuses.find((status) => status === 'unconfirmed' || status === 'signed')
  const lost = locked === 'unconfirmed'
  return (
    <Centred
      kind='alreadyVoted'
      lead={lost ? undefined : <SuccessDisc />}
      headingMt={lost ? undefined : '5'}
      title={lost ? title : t('voter.voted.title')}
      body={lost ? undefined : t('voter.voted.body')}
      privateContent
    >
      {hasCodes ? <ReceiptCard /> : null}
      {locked ? (
        <NoticeCard
          title={locked === 'signed' ? localize('vote.disabled.signed') : localize('vote.disabled.unconfirmed')}
        />
      ) : !hasCodes && anonymous ? (
        <NoticeCard title={t('aside.anonymous_receipt_gone')} />
      ) : null}
      <ResultsLine />
    </Centred>
  )
}
