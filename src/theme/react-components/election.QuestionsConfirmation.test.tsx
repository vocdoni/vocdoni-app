import { render, screen } from '~src/test-utils'
import { electionComponents } from './election'
import { type ReactNode } from 'react'
import { Dialog } from '@chakra-ui/react'

const QuestionsConfirmation = electionComponents.QuestionsConfirmation!

describe('electionComponents.QuestionsConfirmation', () => {
  it('renders structured answersView content', () => {
    render(
      <DialogHost>
        <QuestionsConfirmation
          election={{ title: { default: 'Election' } } as any}
          answers={{}}
          answersView={[
            { question: 'Do you eat kiwi?', answers: ['With skin', 'Without skin'] },
            { question: 'Double check', answers: ['Abstain'] },
          ]}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </DialogHost>
    )

    expect(screen.getByText('Election')).toBeInTheDocument()
    expect(screen.getByText('Your vote has been recorded for:')).toBeInTheDocument()
    expect(screen.getByText('Do you eat kiwi?')).toBeInTheDocument()
    expect(screen.getByText(/With skin/)).toBeInTheDocument()
    expect(screen.getByText('Double check')).toBeInTheDocument()
    expect(screen.getByText(/Abstain/)).toBeInTheDocument()
  })
})

function DialogHost({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root open>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>{children}</Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
