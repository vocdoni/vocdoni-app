import { Dialog } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { render, screen } from '~src/test-utils'
import { OutcomeStep } from './OutcomeStep'
import { StatusStep } from './StatusStep'

// A step is always inside the dialog's root and content, which name it
const inDialog = (step: ReactElement) => (
  <Dialog.Root open>
    <Dialog.Positioner>
      <Dialog.Content>{step}</Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
)

describe('publish dialog steps without a lead', () => {
  it('names a wait by its eyebrow, the title of the step', async () => {
    render(
      inDialog(
        <StatusStep title='Publishing the vote' progress={[{ key: 'a', label: 'Publishing', state: 'active' }]} />
      )
    )

    expect(await screen.findByRole('dialog', { name: 'Publishing the vote' })).toBeInTheDocument()
  })

  it('names an outcome by its eyebrow too', async () => {
    render(inDialog(<OutcomeStep title='Publish voting process'>The payment is still open.</OutcomeStep>))

    expect(await screen.findByRole('dialog', { name: 'Publish voting process' })).toBeInTheDocument()
  })
})
