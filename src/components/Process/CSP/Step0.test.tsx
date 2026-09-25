import { render } from '~src/test-utils'
import { Step0Base } from './Step0'

const pending = vi.hoisted(() => ({ value: false }))

vi.mock('./CSPStepsProvider', () => ({
  useCspAuthContext: () => ({
    setCurrentStep: vi.fn(),
    setAuthData: vi.fn(),
    authFields: [],
    twoFaFields: [],
  }),
}))

vi.mock('./basics', () => ({
  useCspAuth0: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCspAuthPending: () => pending.value,
  useIsCspAuthBusy: () => () => pending.value,
}))

describe('Step0Base', () => {
  beforeEach(() => {
    pending.value = false
  })

  it('renders the authenticate button', () => {
    const { getByRole } = render(<Step0Base />)

    expect(getByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })

  it('blocks a second identify request while one from any dialog is in flight', () => {
    pending.value = true

    const { getByRole } = render(<Step0Base />)

    expect(getByRole('button', { name: 'Authenticate' })).toBeDisabled()
  })
})
