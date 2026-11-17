import { useAnonymityLabels } from '~components/Process/anonymityLabels'
import { useVoterFlow } from '../flow-context'
import { ScreenHint } from './ScreenParts'

/**
 * The anonymity promise the organiser chose (the same sentence as the builder's), once on identify and on welcome,
 * as today's page shows it before voting (audit F6). The e2e suite matches it with a single-match query.
 */
export const AnonymityLine = () => {
  const { anonymous } = useVoterFlow()
  const { description } = useAnonymityLabels(anonymous)
  return <ScreenHint>{description}</ScreenHint>
}
