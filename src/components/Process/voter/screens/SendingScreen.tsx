import { Box } from '@chakra-ui/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PhaseList, type PhaseState } from '~components/ui/PhaseList'
import { useVoterFlow } from '../flow-context'
import { ScreenHeading, ScreenHint, VoterScreenFrame } from '../parts/ScreenParts'
import { batchSize, sendingPhase } from '../voter-flow'

/**
 * Sending (board V4VoterWide 9): the phase follows the SDK's per-question status (audit F15), no timers. Also shown,
 * from the second phase, while the SDK re-sends a stored vote right after identification.
 */
export const SendingScreen = () => {
  const { t } = useTranslation()
  const { statuses, moved, election } = useVoterFlow()
  const phase = sendingPhase(statuses)
  // The questions in flight, at their most: one that confirms while the others wait still belongs to this batch.
  const largest = useRef(0)
  largest.current = Math.max(largest.current, batchSize(statuses))
  const count = largest.current || election.questions.length
  const state = (step: 1 | 2 | 3): PhaseState => (phase > step ? 'done' : phase === step ? 'now' : 'next')
  return (
    <VoterScreenFrame kind='sending' privateContent>
      <ScreenHeading focus={moved}>{t('voter.sending.title')}</ScreenHeading>
      <Box mt='6' aria-live='polite'>
        <PhaseList
          items={[
            { id: 'authorize', label: t('voter.sending.authorizing'), state: state(1) },
            { id: 'send', label: t('voter.sending.sending', { count }), state: state(2) },
            { id: 'confirm', label: t('voter.sending.confirming', { count }), state: state(3) },
          ]}
        />
      </Box>
      <ScreenHint>{t('voter.sending.hint')}</ScreenHint>
    </VoterScreenFrame>
  )
}
