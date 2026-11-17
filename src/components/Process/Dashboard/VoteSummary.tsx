import { Card, Grid, Stack } from '@chakra-ui/react'
import { useIsDesktop } from '~components/ui/useIsMobile'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { CensusSearch } from './CensusSearch'
import { useQuestionDockPage } from './summary/by-question/QuestionDock'
import { SummaryCalendar } from './summary/SummaryCalendar'
import { SummaryDownloads } from './summary/SummaryDownloads'
import { SummaryElectoralData } from './summary/SummaryElectoralData'
import { SUMMARY_COLUMNS, SummaryHero } from './summary/SummaryHero'
import { SummaryIdle } from './summary/SummaryIdle'
import { SummaryQuestions } from './summary/SummaryQuestions'
import { SummaryShare } from './summary/SummaryShare'
import { useSummaryModel } from './summary/use-summary-model'

/**
 * Resum: the participation hero (or, for a vote that is not running, where it stands), the questions with their
 * results (and, question by question, the buttons that run them), and beside them the voting data (all at once,
 * desktop) and the calendar (all at once), the voting link and the voter lookup. The desktop follows the V4 boards,
 * a phone or tablet the M4 ones.
 */
export const VoteSummary = () => {
  const model = useSummaryModel()
  const desktop = useIsDesktop({ ssr: false })
  const publicLanguage = usePublicLanguage()
  const dockPage = useQuestionDockPage()

  if (!model) return null

  const { election, byQuestion, state } = model
  // A closed vote keeps the turnout card, with everything a live one shows; only one that never ran reads as a card.
  const idle = !byQuestion && (state === 'ready' || state === 'canceled')
  const authFields = election.census?.authFields ?? []
  const twoFaFields = election.census?.twoFaFields ?? []
  const votingLink = `${document.location.origin}${getPublicProcessPath({ id: election.id, language: publicLanguage })}`

  return (
    <Stack gap={{ base: '5', md: '6', lg: '8' }} css={dockPage}>
      {idle ? <SummaryIdle model={model} /> : <SummaryHero model={model} desktop={desktop} />}
      {/* Two columns only from `xl`, the boards' width: narrower, the question rows would lose their titles. */}
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', xl: SUMMARY_COLUMNS }}
        gap={{ base: '5', md: '6' }}
        alignItems='start'
      >
        <SummaryQuestions model={model} desktop={desktop} />
        <Stack gap={{ base: '5', md: '6', xl: '4' }} minW='0'>
          <SummaryDownloads model={model} />
          {desktop && !byQuestion && <SummaryElectoralData model={model} />}
          {!byQuestion && <SummaryCalendar model={model} />}
          <SummaryShare link={votingLink} desktop={desktop} state={state} />
          {authFields.length + twoFaFields.length > 0 && (
            <Card.Root variant='frame'>
              <Card.Body>
                <CensusSearch />
              </Card.Body>
            </Card.Root>
          )}
        </Stack>
      </Grid>
    </Stack>
  )
}
