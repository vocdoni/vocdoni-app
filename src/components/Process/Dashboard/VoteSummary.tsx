import { Card, Grid, Stack } from '@chakra-ui/react'
import { useIsDesktop } from '~components/ui/useIsMobile'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { CensusSearch } from './CensusSearch'
import { SummaryCalendar } from './summary/SummaryCalendar'
import { SummaryElectoralData } from './summary/SummaryElectoralData'
import { SUMMARY_COLUMNS, SummaryHero } from './summary/SummaryHero'
import { SummaryIdle } from './summary/SummaryIdle'
import { SummaryQuestions } from './summary/SummaryQuestions'
import { SummaryShare } from './summary/SummaryShare'
import { useSummaryModel } from './summary/use-summary-model'

/**
 * Resum: the participation hero (or, for an all-at-once vote that is not running, where it stands), the questions
 * with their results, and beside them the voting data and calendar (all at once, desktop), the voting link and the
 * voter lookup. The desktop follows the V4 boards, a phone or tablet the M4 ones.
 */
export const VoteSummary = () => {
  const model = useSummaryModel()
  const desktop = useIsDesktop()
  const publicLanguage = usePublicLanguage()

  if (!model) return null

  const { election, byQuestion, state } = model
  const idle = !byQuestion && (state === 'ready' || state === 'closed' || state === 'canceled')
  const authFields = election.census?.authFields ?? []
  const twoFaFields = election.census?.twoFaFields ?? []
  const votingLink = `${document.location.origin}${getPublicProcessPath({ id: election.id, language: publicLanguage })}`

  return (
    <Stack gap={{ base: '5', md: '6', lg: '8' }}>
      {idle ? <SummaryIdle model={model} /> : <SummaryHero model={model} desktop={desktop} />}
      {/* Two columns only from `xl`, the boards' width: narrower, the question rows would lose their titles. */}
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', xl: SUMMARY_COLUMNS }}
        gap={{ base: '5', md: '6' }}
        alignItems='start'
      >
        <SummaryQuestions model={model} desktop={desktop} />
        <Stack gap={{ base: '5', md: '6', xl: '4' }} minW='0'>
          {desktop && !byQuestion && <SummaryElectoralData model={model} />}
          {desktop && !byQuestion && <SummaryCalendar model={model} />}
          <SummaryShare link={votingLink} authFields={authFields} twoFaFields={twoFaFields} desktop={desktop} />
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
