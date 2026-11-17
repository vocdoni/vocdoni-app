import { Box, Card, chakra, Flex, Grid, Icon, Link, Stack, Text, useSlotRecipe } from '@chakra-ui/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import { FactList, type Fact } from '~components/ui/FactList'
import { Markdown } from '~components/ui/Markdown'
import { useIsDesktop } from '~components/ui/useIsMobile'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useVoteText } from '~i18n/use-vote-text'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { ChevronRightIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { BallotQuestion } from './ballot/BallotQuestion'
import { BallotStatus } from './ballot/BallotStatus'
import { SummaryCardHeader } from './summary/SummaryCardHeader'
import { SUMMARY_COLUMNS } from './summary/SummaryHero'
import { useSummaryFacts } from './summary/use-summary-facts'
import { useSummaryModel, type SummaryModel } from './summary/use-summary-model'

// The Resum facts reused by "How voting works". "Unanswered question" is left out: the process does not say whether
// a question may be left blank (the voter's form decides it).
const SHARED_FACTS = ['overwrite', 'results']

/** Whatever the voters read before the questions: the description, as markdown, in plain paragraphs. */
const BallotIntro = ({ description }: { description: string }) => {
  const { t } = useTranslation()
  const titleId = useId()
  const styles = useSlotRecipe({ key: 'ballotPaper' })()
  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId} css={styles.intro}>
      <chakra.h3 id={titleId} css={styles.introLabel}>
        {t('votes.ballot.intro', { defaultValue: 'Intro text' })}
      </chakra.h3>
      <Box css={styles.introText}>
        <Markdown components={{ p: ({ children }) => <chakra.p>{children}</chakra.p> }}>{description}</Markdown>
      </Box>
    </Card.Root>
  )
}

const BallotPaper = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const publicLanguage = usePublicLanguage()
  const factsId = useId()
  const styles = useSlotRecipe({ key: 'ballotPaper' })()
  const summaryFacts = useSummaryFacts(model, false)
  const { election, byQuestion } = model
  const count = election.questions.length
  const description = text(election.description)?.trim()
  const facts: Fact[] = [
    {
      id: 'questions',
      label: t('votes.summary.label.questions', { defaultValue: 'Questions' }),
      value: quantity(count),
    },
    {
      id: 'mode',
      label: t('votes.ballot.label.mode', { defaultValue: 'How they are voted' }),
      value: byQuestion
        ? t('votes.ballot.mode.by_question', { defaultValue: 'Question by question, as they open' })
        : t('votes.ballot.mode.all', { defaultValue: 'All at once, on a single ballot' }),
    },
    ...SHARED_FACTS.flatMap((id) => summaryFacts.filter((fact) => fact.id === id)),
  ]

  // The questions render through the ballot type, which cannot be inferred for some legacy processes: each card
  // falls back to its title and options, and the list degrades on its own instead of taking the page down.
  const fallback = (
    <Text color='fg.muted'>{t('error.loading_section', { defaultValue: 'This section could not be loaded' })}</Text>
  )

  return (
    <Grid templateColumns={{ base: 'minmax(0, 1fr)', xl: SUMMARY_COLUMNS }} columnGap='6' rowGap='4' alignItems='start'>
      <Stack gap={{ base: '5', md: '6', lg: '4' }} minW='0'>
        <Flex css={styles.header}>
          <Box css={styles.heading}>
            <chakra.h2>{t('votes.ballot.title', { defaultValue: 'What voters see' })}</chakra.h2>
            <Text as='span' css={styles.count}>
              {byQuestion
                ? t('votes.ballot.count_by_question', {
                    defaultValue_one: '{{count, number}} question',
                    defaultValue_other: '{{count, number}} questions, question by question',
                    count,
                  })
                : t('votes.ballot.count_all', {
                    defaultValue_one: '{{count, number}} question',
                    defaultValue_other: '{{count, number}} questions, all at once',
                    count,
                  })}
            </Text>
          </Box>
          <Link
            variant='row-action'
            href={getPublicProcessPath({ id: election.id, language: publicLanguage })}
            target='_blank'
            rel='noopener noreferrer'
          >
            {desktop
              ? t('votes.page.show_as_voter', { defaultValue: 'Show as voter' })
              : t('votes.ballot.as_voter', { defaultValue: 'As a voter' })}
            <Icon as={ChevronRightIcon} boxSize={{ base: '3.5', lg: 'icon.xs' }} />
          </Link>
        </Flex>
        <Stack gap='4'>
          {description && <BallotIntro description={description} />}
          <ErrorBoundary fallback={fallback} resetKeys={[election]}>
            <Stack as='ol' gap='4' aria-label={t('process.questions')}>
              {election.questions.map((question, index) => (
                <ErrorBoundary
                  key={question.id}
                  fallback={<BallotQuestion question={question} index={index} plain />}
                  resetKeys={[question]}
                >
                  <BallotQuestion question={question} index={index} />
                </ErrorBoundary>
              ))}
            </Stack>
          </ErrorBoundary>
        </Stack>
      </Stack>
      <Stack gap='4' minW='0'>
        <BallotStatus model={model} desktop={desktop} />
        <Card.Root variant='frame' as='section' aria-labelledby={factsId}>
          <SummaryCardHeader id={factsId} title={t('votes.ballot.rules_title', { defaultValue: 'How voting works' })} />
          <FactList facts={facts} layout='ruled' />
        </Card.Root>
      </Stack>
    </Grid>
  )
}

/**
 * Papereta: the ballot as voters will read it (the intro text and each question with its options and how it is
 * answered), and beside it that the ballot is fixed and the rules of the vote. Boards V4VotePaper and M4VotePaper.
 */
export const VoteBallot = () => {
  const model = useSummaryModel()
  const desktop = useIsDesktop({ ssr: false })
  if (!model) return null
  return <BallotPaper model={model} desktop={desktop} />
}
