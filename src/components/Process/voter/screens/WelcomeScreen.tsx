import { Box, Button, Text } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { AgendaList } from '~components/ui/AgendaList'
import { useAppEnv } from '~src/app-env'
import { useVoterFlow } from '../flow-context'
import { textOf, voterTurnout } from '../format'
import { InlineAction, ScreenHeading, ScreenLead, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteStatusLine } from '../parts/VoteStatusLine'
import { VoterMedia } from '../parts/VoterMedia'

const bold = <Box as='b' color='fg' fontWeight='semibold' />

/**
 * Welcome (board V4VoterWide 3, with the count of V4VoterWideMore 7): no greeting and no name (owner ruling), the
 * count and census lines, the agenda, "Comença a votar" and the nameless "No ets tu? Surt".
 */
export const WelcomeScreen = () => {
  const { t } = useTranslation()
  const env = useAppEnv()
  const { election, facts, weighted, moved, start, signOut } = useVoterFlow()
  const turnout = facts.secretUntilTheEnd ? null : voterTurnout(election, env)
  // Hidden at 0 (ruling R4); "votes" for a weighted census and "people" otherwise, as the old aside worded it (R15).
  const count = turnout && turnout.count > 0 ? turnout.count : null
  // The census size, as the old info panel read it (`election.census.size`, absent means empty) and worded it (R17).
  const censusSize = election.census?.size ?? 0

  return (
    <VoterScreenFrame kind='welcome' privateContent>
      <VoteStatusLine />
      <ScreenHeading focus={moved} mt='2.5'>
        {textOf(election.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      {count !== null && (
        <Text as='p' textStyle='ballot-hint' color='fg.muted' mt='1.5'>
          {weighted ? (
            <Trans i18nKey='aside.votes_weight' count={count} components={{ span: bold, text: <span /> }} />
          ) : (
            <Trans i18nKey='voter.welcome.count' count={count} components={{ b: bold }} />
          )}
        </Text>
      )}
      {censusSize > 0 && (
        <Text as='p' textStyle='ballot-hint' color='fg.muted' mt={count !== null ? '0.5' : '1.5'}>
          {t('process.people_in_census', { count: censusSize })}
        </Text>
      )}
      <ScreenLead>{t('voter.welcome.lead')}</ScreenLead>
      <VoterMedia />
      <AgendaList
        label={t('voter.agenda')}
        items={election.questions.map((question, index) => ({
          id: question.id,
          number: String(index + 1),
          title: textOf(question.title as Parameters<typeof textOf>[0]),
        }))}
      />
      <VoterActionBar
        primary={
          <Button size='ballot' onClick={start}>
            {t('voter.welcome.start')}
          </Button>
        }
        note={<Trans i18nKey='voter.not_you' components={{ exit: <InlineAction onClick={signOut} /> }} />}
      />
    </VoterScreenFrame>
  )
}
