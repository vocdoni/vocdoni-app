import { render, screen } from '~src/test-utils'
import userEvent from '@testing-library/user-event'
import { CspAuthModal } from './CSPAuthModal'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    election: { id: 'test-election' },
  }),
}))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({ currentStep: 0 }),
}))

vi.mock('./Step0', () => ({
  Step0Base: () => <div>Step 0</div>,
}))

vi.mock('./Step1', () => ({
  Step1Base: () => <div>Step 1</div>,
}))

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()

  return {
    ...actual,
    Dialog: {
      ...actual.Dialog,
      Backdrop: (props: any) => (
        <actual.Dialog.Backdrop data-testid='csp-backdrop' data-zindex={props.zIndex} {...props} />
      ),
      Positioner: (props: any) => (
        <actual.Dialog.Positioner data-testid='csp-positioner' data-zindex={props.zIndex} {...props} />
      ),
    },
  }
})

describe('CspAuthModal', () => {
  it('applies modal z-index layers to backdrop and positioner', async () => {
    const user = userEvent.setup()

    render(<CspAuthModal />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByTestId('csp-backdrop')).toHaveAttribute('data-zindex', 'modal')
    expect(screen.getByTestId('csp-positioner')).toHaveAttribute('data-zindex', 'modal')
  })
})
