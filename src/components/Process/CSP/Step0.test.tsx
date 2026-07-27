import { render } from '~src/test-utils'
import { Step0Base } from './Step0'

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
}))

describe('Step0Base', () => {
  it('renders the authenticate button', () => {
    const { getByRole } = render(<Step0Base />)

    expect(getByRole('button', { name: 'Authenticate' })).toBeTruthy()
  })
})
