import type { PublishedElection } from '@vocdoni/sdk'
import { fireEvent, mockUseElection, render, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Step1Base } from './Step1'

const mutateAsync = vi.fn()

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    authData: {
      authToken: 'token',
    },
  }),
}))

vi.mock('./basics', () => ({
  useTwoFactorAuth: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
  }),
}))

describe('Step1Base', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ authToken: 'next-token' })

    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          actions: {
            csp1: vi.fn(),
          },
        }),
    })
  })

  it('renders the authenticate button', async () => {
    const election = {} as PublishedElection
    const { findByRole } = render(<Step1Base election={election} />)

    expect(await findByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })

  it('does not render undefined values when pasting the pin code', async () => {
    const election = {} as PublishedElection
    const { container } = render(<Step1Base election={election} />)

    const pinInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[data-ownedby]'))
    expect(pinInputs).toHaveLength(6)

    fireEvent.focus(pinInputs[0])
    fireEvent.input(pinInputs[0], {
      target: { value: '123456' },
      inputType: 'insertFromPaste',
    })

    await waitFor(() => {
      const pinValues = Array.from(container.querySelectorAll<HTMLInputElement>('input[data-ownedby]')).map(
        (input) => input.value
      )
      expect(pinValues).toEqual(['1', '2', '3', '4', '5', '6'])
      expect(pinValues).not.toContain('undefined')
    })
  })
})
