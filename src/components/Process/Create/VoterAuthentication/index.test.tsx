import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { VocdoniApiError } from '@vocdoni/api-client'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { mockUseOrganization, render, screen, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoterAuthentication } from '.'
import { Census, defaultQuestion, Process } from '../common'

const mockValidateCensus = vi.fn()
const mockTrackAnalyticsEvent = vi.fn()

// Partial mock: AllProviders (used by render) still mounts the real ApiClientProvider.
vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { validateCensus: mockValidateCensus } } }),
}))

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}))

const FormState = () => {
  const {
    watch,
    formState: { dirtyFields },
  } = useFormContext<Process>()

  return (
    <>
      <div data-testid='form-census'>{JSON.stringify(watch('census'))}</div>
      <div data-testid='census-dirty'>{String(!!dirtyFields.census)}</div>
    </>
  )
}

const savedCensus: Census = {
  credentials: ['memberNumber'],
  use2FA: false,
  use2FAMethod: 'email',
}

const TestForm = ({
  initialCensus = savedCensus,
  anonymousVoting = false,
  weightedVote = false,
}: {
  initialCensus?: Census | null
  anonymousVoting?: boolean
  weightedVote?: boolean
}) => {
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
      weightedVote,
      anonymousVoting,
      groupId: 'group-1',
      census: initialCensus,
      censusType: CensusTypes.CSP,
      streamUri: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <VoterAuthentication />
      <FormState />
    </FormProvider>
  )
}

const storedCensus = () => JSON.parse(screen.getByTestId('form-census').textContent!)

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /voter authentication/i }))
  return within(await screen.findByRole('dialog'))
}

// The code options are radio cards whose accessible name also carries their
// description, so they are picked by value, as the e2e suite does.
const chooseCode = async (user: ReturnType<typeof userEvent.setup>, value: string) =>
  user.click(
    screen.getByRole('dialog').querySelector<HTMLInputElement>(`input[name="use2FAMethod"][value="${value}"]`)!
  )

const membersError = (data: Record<string, unknown>) =>
  new VocdoniApiError(400, { error: 'invalid census', code: 4000, data }, 'invalid census')

describe('VoterAuthentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateCensus.mockResolvedValue('ok')
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0x1' } }),
    })
  })

  it('shows Configure button when census is null', () => {
    render(<TestForm initialCensus={null} />)
    expect(screen.getByRole('button', { name: /configure voter authentication/i })).toBeInTheDocument()
  })

  it('summarizes the saved settings with readable labels', () => {
    render(<TestForm initialCensus={{ credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'sms' }} />)

    const summary = within(screen.getByTestId('voter-auth-summary'))
    expect(summary.getByText('Voters type: Member Number')).toBeInTheDocument()
    expect(summary.getByText('One-time code by SMS')).toBeInTheDocument()
    expect(summary.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit voter authentication/i })).toBeInTheDocument()
  })

  it('saves the chosen details and code, checking the members first', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await chooseCode(user, 'email')

    // The preview follows the configuration.
    const preview = within(dialog.getByTestId('voter-signin-preview'))
    expect(preview.getByText('Member Number *')).toBeInTheDocument()
    expect(preview.getByText('Email *')).toBeInTheDocument()

    await waitFor(() => expect(dialog.getByTestId('member-check')).toHaveAttribute('data-status', 'valid'))
    // Debounced: the two clicks above cost one request for the final configuration.
    expect(mockValidateCensus).toHaveBeenCalledTimes(1)
    expect(mockValidateCensus).toHaveBeenCalledWith({
      orgAddress: '0x1',
      census: { groupId: 'group-1', authFields: ['memberNumber'], twoFaFields: ['email'] },
    })

    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({ credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' })
    // Saving must count as an edit, or the draft autosave would skip it.
    expect(screen.getByTestId('census-dirty')).toHaveTextContent('true')
    // Save reuses the cached check instead of asking again.
    expect(mockValidateCensus).toHaveBeenCalledTimes(1)
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'census_configured',
      props: { auth_fields_count: 1, two_fa: true, two_fa_method: 'email' },
    })
  })

  it('checks the census as it will be published, weighting and anonymity included', async () => {
    const user = userEvent.setup()
    render(<TestForm anonymousVoting weightedVote />)
    await openDialog(user)

    await waitFor(() => expect(mockValidateCensus).toHaveBeenCalled())
    expect(mockValidateCensus).toHaveBeenCalledWith({
      orgAddress: '0x1',
      census: { groupId: 'group-1', authFields: ['memberNumber'], weighted: true, anonymous: true },
    })
  })

  it('discards unsaved edits when the dialog is cancelled', async () => {
    const user = userEvent.setup()
    render(<TestForm />)

    let dialog = await openDialog(user)
    await user.click(dialog.getByRole('checkbox', { name: /national id/i }))
    expect(dialog.getByRole('checkbox', { name: /national id/i })).toBeChecked()
    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    dialog = await openDialog(user)
    expect(dialog.getByRole('checkbox', { name: /national id/i })).not.toBeChecked()
    expect(dialog.getByRole('checkbox', { name: /member number/i })).toBeChecked()
    expect(storedCensus()).toEqual(savedCensus)
  })

  it('does not report census_configured when a re-save changes nothing', async () => {
    const user = userEvent.setup()
    render(<TestForm />)
    const dialog = await openDialog(user)

    await waitFor(() => expect(dialog.getByTestId('member-check')).toHaveAttribute('data-status', 'valid'))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled()
  })

  // The backend's real verdict shape: `memberIds` lists the members that PASS,
  // `duplicates` both members of each clashing pair, `missingData` the incomplete
  // ones. A 6-member list with one repeated first name: 5 pass, 2 clash.
  it('reports a duplicated detail with the exact number of members involved', async () => {
    mockValidateCensus.mockRejectedValue(
      membersError({ memberIds: ['m1', 'm2', 'm3', 'm4', 'm5'], duplicates: ['m5', 'm6'], missingData: null })
    )
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /first name/i }))

    const status = dialog.getByTestId('member-check')
    await waitFor(() => expect(status).toHaveAttribute('data-status', 'invalid'))
    expect(status).toHaveTextContent("2 members share the same First Name, so they can't be told apart.")
    expect(status).not.toHaveTextContent(/5/)
    expect(status).not.toHaveTextContent(/member number/i)

    await user.click(dialog.getByTestId('voter-auth-save'))

    // Refused: focus moves to the verdict beside the button, which says why.
    await waitFor(() => expect(status).toHaveFocus())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(storedCensus()).toBeNull()
  })

  it('reports members missing a code contact and blocks saving', async () => {
    mockValidateCensus.mockRejectedValue(
      membersError({ memberIds: ['m1', 'm2'], duplicates: [], missingData: ['m3', 'm4', 'm5'] })
    )
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'email')

    const status = dialog.getByTestId('member-check')
    await waitFor(() => expect(status).toHaveAttribute('data-status', 'invalid'))
    expect(status).toHaveTextContent('3 members are missing Email.')

    await user.click(dialog.getByTestId('voter-auth-save'))
    await waitFor(() => expect(status).toHaveFocus())
    expect(storedCensus()).toBeNull()
  })

  // The backend says a member is incomplete, not which field is empty: with
  // several fields chosen, each is re-checked alone to name the one missing.
  it('names the exact field members are missing when several are chosen', async () => {
    mockValidateCensus.mockImplementation(({ census }) => {
      const onlyContact = !census.authFields?.length && census.twoFaFields?.length
      const onlyMemberNumber = census.authFields?.length === 1 && !census.twoFaFields?.length
      if (onlyMemberNumber) return Promise.resolve('OK')
      if (onlyContact || census.twoFaFields?.length)
        return Promise.reject(
          membersError({ memberIds: ['m1', 'm2', 'm3'], duplicates: [], missingData: ['m4', 'm5', 'm6'] })
        )
      return Promise.resolve('OK')
    })
    const user = userEvent.setup()
    render(<TestForm />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'email')

    const status = dialog.getByTestId('member-check')
    await waitFor(() => expect(status).toHaveTextContent('3 members are missing Email.'))
    expect(status).not.toHaveTextContent(/Member Number/)
  })

  it('names both contacts when voters choose between email and SMS', async () => {
    // Only the contact check fails: these members have neither an email nor a phone.
    mockValidateCensus.mockImplementation(({ census }) =>
      census.twoFaFields?.length
        ? Promise.reject(membersError({ memberIds: ['m1'], duplicates: [], missingData: ['m2'] }))
        : Promise.resolve('OK')
    )
    const user = userEvent.setup()
    render(<TestForm />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'voter_choice')

    const status = dialog.getByTestId('member-check')
    await waitFor(() => expect(status).toHaveTextContent('1 members are missing both Email and Phone.'))
  })

  it('still saves when the member check itself is unavailable', async () => {
    mockValidateCensus.mockRejectedValue(new VocdoniApiError(503, { error: 'unavailable' }, 'unavailable'))
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByTestId('member-check')).toHaveAttribute('data-status', 'unavailable'))

    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({ credentials: ['memberNumber'], use2FA: false, use2FAMethod: 'email' })
  })

  it('asks for a choice before saving an empty configuration, without calling the backend', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByTestId('voter-auth-save'))

    const status = dialog.getByTestId('member-check')
    expect(status).toHaveTextContent(/at least one detail or a code/i)
    expect(status).toHaveFocus()
    expect(mockValidateCensus).not.toHaveBeenCalled()
  })

  it('accepts a one-time code without any other detail', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'sms')
    await waitFor(() => expect(dialog.getByTestId('member-check')).toHaveAttribute('data-status', 'valid'))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({ credentials: [], use2FA: true, use2FAMethod: 'sms' })
  })

  it('reports no two-factor method when no code is sent', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={{ credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'sms' }} />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'none')
    await waitFor(() => expect(dialog.getByTestId('member-check')).toHaveAttribute('data-status', 'valid'))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1))
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'census_configured',
      props: { auth_fields_count: 1, two_fa: false, two_fa_method: 'none' },
    })
  })
})
