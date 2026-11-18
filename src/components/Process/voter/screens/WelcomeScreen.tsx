import { Button } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { AgendaList } from '~components/ui/AgendaList'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { InlineAction, ScreenHeading, ScreenLead, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteStatusLine } from '../parts/VoteStatusLine'
import { VoterMedia } from '../parts/VoterMedia'

/**
 * Welcome (board V4VoterWide 3): no greeting and no name (owner ruling), no vote count and no census size (ruling
 * R23), the questions to vote on, "Comença a votar" and the nameless "No ets tu? Surt".
 */
export const WelcomeScreen = () => {
  const { t } = useTranslation()
  const { election, moved, start, signOut } = useVoterFlow()

  return (
    <VoterScreenFrame kind='welcome' privateContent>
      <VoteStatusLine />
      <ScreenHeading focus={moved} mt='2.5'>
        {textOf(election.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
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
