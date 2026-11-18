import { Alert, Box, Button, Card, chakra, Text } from '@chakra-ui/react'
import { useReactComponentsLocalize } from '@vocdoni/react-components'
import { useEffect, useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useVoterFlow } from '../flow-context'
import { describeAnswer, textOf } from '../format'
import { VOTER_CAST_ARM_MS } from '../live'
import { PausedNotice } from '../parts/PausedNotice'
import { InlineAction, ScreenHeading, ScreenHelp, ScreenKicker, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'

/** One row of the review card: the question (or "Pes del teu vot"), the answer, and "Canvia". */
const ReviewRow = ({
  label,
  value,
  action,
  first = false,
  shaded = false,
}: {
  label: ReactNode
  value: ReactNode
  action?: ReactNode
  first?: boolean
  /** The vote-weight row: the board's light fill under the card's top corners (V4VoterWideMore 5). */
  shaded?: boolean
}) => (
  <Box
    display='grid'
    gridTemplateColumns='1fr auto'
    columnGap='4'
    rowGap='0.5'
    alignItems='center'
    px='4.5'
    py='3.5'
    borderTopWidth={first ? undefined : 'hairline'}
    borderColor='border'
    bg={shaded ? 'bg.subtle' : undefined}
    borderTopRadius={shaded ? 'xl' : undefined}
  >
    <Text as='span' fontSize='md' lineHeight='moderate' color='fg.subtle' gridColumn='1'>
      {label}
    </Text>
    <Text as='span' textStyle='ballot-row-value' gridColumn='1'>
      {value}
    </Text>
    {action ? (
      <Box gridColumn='2' gridRow='1 / span 2'>
        {action}
      </Box>
    ) : null}
  </Box>
)

/**
 * Review (board V4VoterWide 8; weight as the first row, V4VoterWideMore 5): everything that will be sent and the last
 * moment to change it. "Emet el vot" calls the SDK's own `vote()` with the flow's answers (audit F3); a failure shows
 * the SDK's sentence and "Torna-ho a provar", which re-sends the stored transactions.
 */
export const ReviewScreen = ({ paused }: { paused: boolean }) => {
  const { t } = useTranslation()
  const localize = useReactComponentsLocalize()
  const { election, state, weight, weighted, moved, voteIds, lockedNotice, change, cast, casting, facts, signOut } =
    useVoterFlow()
  const words = {
    blank: t('voter.question.blank'),
    ranked: (position: number, label: string) => t('voter.answer.ranked_item', { position, label }),
  }
  const failed = state.castError !== null
  const message = state.castError || localize('errors.vote_failed_unknown')
  // "Emet el vot" sits where "Continua" was on a phone and this screen replaces the question inside the same tap: the
  // button stays off (the `disabled` attribute, same size and place) for a moment, so neither the second tap of a
  // double tap nor a click queued behind it can cast. Each mount arms on its own, a StrictMode re-mount included.
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), VOTER_CAST_ARM_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <VoterScreenFrame kind='review' privateContent>
      {paused && <PausedNotice />}
      <ScreenKicker>{t('voter.review.kicker')}</ScreenKicker>
      <ScreenHeading focus={moved}>{t('voter.review.title')}</ScreenHeading>
      <ScreenHelp>
        <Trans i18nKey='voter.not_you' components={{ exit: <InlineAction onClick={signOut} /> }} />
      </ScreenHelp>
      <Card.Root variant='ballot' mt='6' className='ph-no-capture'>
        {weighted && weight !== null && (
          <ReviewRow
            first
            shaded
            label={t('voter.review.weight_label')}
            value={t('voter.review.weight_value', { weight })}
          />
        )}
        {election.questions.map((question, index) => {
          const notice = lockedNotice(question.id)
          const title = textOf(question.title as Parameters<typeof textOf>[0])
          return (
            <ReviewRow
              key={question.id}
              first={index === 0 && !(weighted && weight !== null)}
              label={title}
              value={
                notice
                  ? localize(notice)
                  : describeAnswer(question, state.answers[String(index)], words, { positions: true })
              }
              action={
                notice || voteIds[question.id] ? undefined : (
                  <chakra.button
                    type='button'
                    textStyle='ballot-caption'
                    color='accent.fg'
                    cursor='button'
                    focusVisibleRing='outside'
                    aria-label={t('voter.review.change_label', { question: title })}
                    onClick={() => change(index)}
                  >
                    {t('voter.review.change')}
                  </chakra.button>
                )
              }
            />
          )
        })}
      </Card.Root>
      {failed && (
        <Alert.Root status='error' layout='ballot' mt='6' role='alert'>
          <Alert.Content>
            <Alert.Description>{message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <VoterActionBar
        primary={
          // data-testid: the cast button's words change after a failure, and it is the step e2e waits on.
          <Button
            size='ballot'
            data-testid='voter-cast'
            disabled={!armed || casting || facts.voting || paused}
            loading={casting}
            onClick={() => {
              if (armed) void cast()
            }}
          >
            {failed ? t('voter.review.retry') : t('voter.review.cast')}
          </Button>
        }
        note={paused ? t('voter.status.paused') : t('voter.review.note')}
      />
    </VoterScreenFrame>
  )
}
