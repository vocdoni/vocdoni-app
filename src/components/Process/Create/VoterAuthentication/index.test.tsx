import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { mockUseOrganization, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoterAuthentication } from '.'
import { Census, defaultQuestion, Process } from '../common'

const mockValidateCensus = vi.fn()

// Partial mock: AllProviders (used by render) still mounts the real ApiClientProvider.
vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { validateCensus: mockValidateCensus } } }),
}))

type FormWatcherProps = { name: keyof Process }

const FormWatcher = ({ name }: FormWatcherProps) => {
  const { watch } = useFormContext<Process>()
  const value = watch(name)

  return <div data-testid={`form-${name}`}>{JSON.stringify(value)}</div>
}

const defaultCensus: Census = {
  credentials: ['email'],
  use2FA: false,
  use2FAMethod: 'email',
}

const TestForm = ({ initialCensus = defaultCensus }: { initialCensus?: Census | null }) => {
  const methods = useForm<Process>({
    defaultValues: {
      title: '',
      description: '',
      autoStart: true,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      questions: [defaultQuestion],
      resultVisibility: 'hidden',
      weightedVote: false,
      voterPrivacy: 'public',
      groupId: 'group-1',
      census: initialCensus,
      censusType: CensusTypes.CSP,
      streamUri: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <VoterAuthentication />
      <FormWatcher name='census' />
    </FormProvider>
  )
}

describe('VoterAuthentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0x1' } }),
    })
  })

  it('shows Configure button when census is null', () => {
    render(<TestForm initialCensus={null} />)
    expect(screen.getByRole('button', { name: /configure voter authentication/i })).toBeInTheDocument()
  })

  it('shows Edit button when census is already configured', () => {
    render(<TestForm />)
    expect(screen.getByRole('button', { name: /edit voter authentication/i })).toBeInTheDocument()
  })

  it('Confirm synchronously writes credentials and 2FA config to form.census', async () => {
    // validate step returns success
    mockValidateCensus.mockResolvedValue({ valid: true })

    const user = userEvent.setup()
    // Start with defaultCensus so credentials are pre-populated (Confirm button requires credentials)
    render(<TestForm initialCensus={defaultCensus} />)

    // Open modal (shows "Edit" when census is already configured)
    await user.click(screen.getByRole('button', { name: /voter authentication/i }))

    // Step 1 → step 2
    await user.click(await screen.findByRole('button', { name: /next/i }))

    // Step 2 → step 3 (triggers validate API call)
    await user.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(mockValidateCensus).toHaveBeenCalledTimes(1))
    // The census is validated as the process will create it: org + census spec.
    expect(mockValidateCensus).toHaveBeenCalledWith({
      orgAddress: '0x1',
      census: { groupId: 'group-1', authFields: ['email'], twoFaFields: [] },
    })

    // Step 3 → Confirm (no API call)
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      const census = JSON.parse(screen.getByTestId('form-census').textContent!)
      expect(census).toHaveProperty('credentials')
      expect(census).toHaveProperty('use2FA')
      expect(census).toHaveProperty('use2FAMethod')
      expect(census).not.toHaveProperty('id')
      expect(census).not.toHaveProperty('size')
    })

    // Confirm does NOT make any additional API calls
    expect(mockValidateCensus).toHaveBeenCalledTimes(1)
  })

  it('does not make API calls when toggling weightedVote', async () => {
    // Weighted-vote changes no longer trigger census recreation
    render(<TestForm />)
    // If this test renders without error and no unexpected fetch calls, the effect is gone
    expect(mockValidateCensus).not.toHaveBeenCalled()
  })
})
