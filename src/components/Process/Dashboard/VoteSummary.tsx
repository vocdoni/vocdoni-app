import { Card, Grid, Stack } from '@chakra-ui/react'
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
 * Gestió: the turnout card (or, for a vote that is not running, where it stands), the questions with their results
 * (and, question by question, the buttons that run them), and beside them (under them below `xl`) the voting link,
 * the downloads of a closed vote, the voting data, the calendar (all at once) and the voter lookup. The same content
 * at every width.
 */
export const VoteSummary = () => {
  const model = useSummaryModel()
  const publicLanguage = usePublicLanguage()
  const dockPage = useQuestionDockPage()

  if (!model) return null

  const { election, byQuestion, state } = model
  // A closed vote keeps the turnout card, with everything a live one shows; a ready or canceled one says where it stands.
  const idle = state === 'ready' || state === 'canceled'
  const authFields = election.census?.authFields ?? []
  const twoFaFields = election.census?.twoFaFields ?? []
  const votingLink = `${document.location.origin}${getPublicProcessPath({ id: election.id, language: publicLanguage })}`

  return (
    <Stack gap={{ base: '5', md: '6', lg: '8' }} css={dockPage}>
      {idle ? <SummaryIdle model={model} /> : <SummaryHero model={model} />}
      {/* Two columns only from `xl`, the boards' width: narrower, the question rows would lose their titles. */}
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', xl: SUMMARY_COLUMNS }}
        gap={{ base: '5', md: '6' }}
        alignItems='start'
      >
        <SummaryQuestions model={model} />
        <Stack gap={{ base: '5', md: '6', xl: '4' }} minW='0'>
          <SummaryShare link={votingLink} state={state} />
          <SummaryDownloads model={model} />
          <SummaryElectoralData model={model} />
          {!byQuestion && <SummaryCalendar model={model} />}
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
