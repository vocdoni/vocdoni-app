import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import LogoutButton from './LogoutButton'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

describe('LogoutButton', () => {
  const clearVoter = vi.fn()

  beforeEach(() => {
    clearVoter.mockReset()
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          connected: true,
          clearVoter,
        }),
    })
  })

  it('renders logout button when connected', () => {
    render(<LogoutButton />)
    expect(screen.getByText('logout')).toBeInTheDocument()
  })

  it('clears the voter session on click', async () => {
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByText('logout'))

    expect(clearVoter).toHaveBeenCalled()
  })

  it('renders nothing when not connected', () => {
    setReactProvidersMock({
      useElection: () => mockUseElection({ connected: false }),
    })

    render(<LogoutButton />)

    expect(screen.queryByText('logout')).not.toBeInTheDocument()
  })
})
