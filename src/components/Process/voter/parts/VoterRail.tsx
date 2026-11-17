import { useTranslation } from 'react-i18next'
import { StepRail, type StepRailItem } from '~components/ui/StepRail'
import { useVoterFlow } from '../flow-context'
import { describeAnswer, textOf } from '../format'

/** The agenda from `lg` (board W4 to W8): every question with the voter's answer, then "Revisa i emet el vot". */
export const VoterRail = () => {
  const { t } = useTranslation()
  const { election, screen, state, facts, goTo, review } = useVoterFlow()
  const words = { blank: t('voter.question.blank'), ranked: () => '' }
  const current = screen.kind === 'question' ? screen.index : screen.kind === 'review' ? election.questions.length : -1
  const reachable = facts.answered.findIndex((done) => !done)
  const items: StepRailItem[] = election.questions.map((question, index) => {
    const done = facts.answered[index] && index !== current
    return {
      id: question.id,
      number: String(index + 1),
      title: textOf(question.title as Parameters<typeof textOf>[0]),
      state: index === current ? 'now' : done ? 'done' : 'pending',
      detail: done ? describeAnswer(question, state.answers[String(index)], words) || undefined : undefined,
      onSelect: index !== current && (reachable === -1 || index <= reachable) ? () => goTo(index) : undefined,
    }
  })
  items.push({
    id: 'review',
    number: String(election.questions.length + 1),
    title: t('voter.rail.review'),
    state: screen.kind === 'review' ? 'now' : 'pending',
    onSelect: screen.kind !== 'review' && reachable === -1 ? review : undefined,
  })
  return <StepRail items={items} />
}
