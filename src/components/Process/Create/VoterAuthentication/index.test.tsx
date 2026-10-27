import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { VocdoniApiError } from '@vocdoni/api-client'
import { FormProvider, useController, useForm, useFormContext } from 'react-hook-form'
import { CensusTypes } from '~components/Process/Census/CensusType'
import { act, mockUseOrganization, render, screen, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoterAuthentication } from '.'
import { Census, defaultQuestion, Process } from '../common'
import { CENSUS_SETUP_TOAST_ID } from '../useCensusSetupToast'
import { useVoterAuthDialog, VoterAuthDialogProvider } from './VoterAuthDialogContext'

const mockValidateCensus = vi.fn()
const mockToast = vi.fn()
const mockCloseToast = vi.fn()

// The test render wraps everything in the real ToastProvider, so keep it.
vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => Object.assign(mockToast, { close: mockCloseToast }),
}))
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

// Mirrors GroupCensusCreation, which registers the census rule and hands the
// field's ref to the dialog trigger.
const RegisteredVoterAuthentication = () => {
  const {
    field: { ref },
  } = useController<Process, 'census'>({ name: 'census', rules: { required: true } })
  return <VoterAuthentication triggerRef={ref} />
}

const TestForm = ({
  initialCensus = savedCensus,
  anonymousVoting = false,
  weightedVote = false,
  groupId = 'group-1',
}: {
  initialCensus?: Census | null
  anonymousVoting?: boolean
  weightedVote?: boolean
  groupId?: string
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
      groupId,
      census: initialCensus,
      censusType: CensusTypes.CSP,
      streamUri: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <RegisteredVoterAuthentication />
      <FormState />
      {/* Stands in for the create view's Publish: runs the main form's validation. */}
      <button type='button' onClick={() => methods.handleSubmit(() => {})()}>
        Publish
      </button>
      {/* Stands in for a group change, which voids the configured census. */}
      <button type='button' onClick={() => methods.setValue('census', null)}>
        Reset census
      </button>
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

    expect(screen.getByText('Voters type: Member Number')).toBeInTheDocument()
    expect(screen.getByText('One-time code by SMS')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit voter authentication/i })).toBeInTheDocument()
  })

  it('flags voter authentication as still required once a group is picked', () => {
    render(<TestForm initialCensus={null} />)

    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent(/required before publishing/i)
    expect(within(notice).getByRole('button', { name: /configure voter authentication/i })).toBeEnabled()
  })

  it('shows no pending notice before a group is picked or once configured', () => {
    const { unmount } = render(<TestForm initialCensus={null} groupId='' />)
    expect(screen.queryByText(/required before publishing/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /configure voter authentication/i })).toBeDisabled()
    unmount()

    render(<TestForm />)
    expect(screen.queryByText(/required before publishing/i)).not.toBeInTheDocument()
  })

  it('turns the notice into an error and focuses its button when a publish is blocked on it', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)

    await user.click(screen.getByRole('button', { name: /publish/i }))

    const notice = await screen.findByRole('alert')
    expect(notice).toHaveTextContent(/you need this to publish/i)
    await waitFor(() =>
      expect(within(notice).getByRole('button', { name: /configure voter authentication/i })).toHaveFocus()
    )
  })

  it('keeps the previous choices ticked after the census is reset', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={savedCensus} />)

    await user.click(screen.getByRole('button', { name: /reset census/i }))
    await user.click(
      within(screen.getByRole('status')).getByRole('button', { name: /configure voter authentication/i })
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog.querySelector('input[value="memberNumber"]')).toBeChecked()
  })

  it('hands focus back to the trigger, and clears the missing-auth toast, after the first save', async () => {
    mockValidateCensus.mockResolvedValue({ valid: true })
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)

    // Opened from the pending notice; confirming moves the trigger below the summary.
    await user.click(
      within(screen.getByRole('status')).getByRole('button', { name: /configure voter authentication/i })
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(dialog.querySelector('input[value="memberNumber"]')!)
    await waitFor(() => expect(within(dialog).getByRole('status')).toHaveAttribute('data-status', 'valid'))
    await user.click(within(dialog).getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.getByRole('button', { name: /edit voter authentication/i })).toHaveFocus())
    expect(mockCloseToast).toHaveBeenCalledWith(CENSUS_SETUP_TOAST_ID)
  })

  it('opens from outside through the shared dialog state', async () => {
    const OpenFromOutside = () => {
      const { onOpen } = useVoterAuthDialog()
      return (
        <button type='button' onClick={onOpen}>
          Set it up
        </button>
      )
    }
    const user = userEvent.setup()
    render(
      <VoterAuthDialogProvider>
        <TestForm initialCensus={null} />
        <OpenFromOutside />
      </VoterAuthDialogProvider>
    )

    await user.click(screen.getByRole('button', { name: /set it up/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('saves the chosen details and code, checking the members first', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await chooseCode(user, 'email')

    // The preview follows the configuration.
    // Below md the preview's wrapper is display:none, and jsdom applies the base breakpoint, so it is hidden here.
    const preview = within(dialog.getByRole('region', { name: 'What voters will see', hidden: true }))
    expect(preview.getByText('Member Number *')).toBeInTheDocument()
    expect(preview.getByText('Email *')).toBeInTheDocument()

    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))
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
    // Save asks the backend afresh, even though the check above is cached.
    expect(mockValidateCensus).toHaveBeenCalledTimes(2)
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

    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))
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

    const status = dialog.getByRole('status')
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

    const status = dialog.getByRole('status')
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

    const status = dialog.getByRole('status')
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

    const status = dialog.getByRole('status')
    await waitFor(() => expect(status).toHaveTextContent('1 members are missing both Email and Phone.'))
  })

  it('still saves when the member check itself is unavailable', async () => {
    mockValidateCensus.mockRejectedValue(new VocdoniApiError(503, { error: 'unavailable' }, 'unavailable'))
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'unavailable'))

    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({ credentials: ['memberNumber'], use2FA: false, use2FAMethod: 'email' })
  })

  // A 400 with no member issues means the census itself is unusable (e.g. its
  // group was deleted): saving it would store something that cannot work.
  it('keeps the dialog open and says why when the backend rejects the census', async () => {
    mockValidateCensus.mockRejectedValue(new VocdoniApiError(400, { error: 'group not found' }, 'group not found'))
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'rejected'))
    expect(dialog.getByRole('status')).toHaveTextContent("This sign-in can't be used with your member list.")
    expect(dialog.getByRole('status')).not.toHaveTextContent(/still save/i)

    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', title: 'Sign-in settings not saved', description: 'group not found' })
      )
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(storedCensus()).toBeNull()
  })

  it('locks the choices while the save is checking, so edits cannot be lost', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)
    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))

    // Hold the save's check open, so the voter can try to edit mid-save.
    let answer: (value: string) => void = () => {}
    mockValidateCensus.mockImplementation(() => new Promise((resolve) => (answer = resolve)))
    await user.click(dialog.getByRole('checkbox', { name: /national id/i }))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(dialog.getByRole('checkbox', { name: /member number/i })).toBeDisabled())
    expect(dialog.getByRole('checkbox', { name: /first name/i })).toBeDisabled()
    await user.click(dialog.getByRole('checkbox', { name: /first name/i }))

    answer('ok')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({
      credentials: ['memberNumber', 'nationalId'],
      use2FA: false,
      use2FAMethod: 'email',
    })
  })

  it('discards a save still checking when the dialog is closed mid-check', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)
    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))

    // Hold the save's check open, then close the dialog while it waits.
    let answer: (value: string) => void = () => {}
    mockValidateCensus.mockImplementation(() => new Promise((resolve) => (answer = resolve)))
    await user.click(dialog.getByRole('checkbox', { name: /national id/i }))
    await user.click(dialog.getByTestId('voter-auth-save'))
    await waitFor(() => expect(dialog.getByRole('checkbox', { name: /first name/i })).toBeDisabled())

    await user.click(dialog.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await act(async () => answer('ok'))

    expect(storedCensus()).toBeNull()
    expect(mockToast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Sign-in settings saved' }))
  })

  // The answer is cached for a minute, so a member list fixed since then must be re-read on Save.
  it('re-reads the member list on save instead of the answer cached before it was fixed', async () => {
    mockValidateCensus.mockRejectedValue(
      membersError({ memberIds: ['m1'], duplicates: ['m2', 'm3'], missingData: null })
    )
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)
    await user.click(dialog.getByRole('checkbox', { name: /first name/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'invalid'))

    // The duplicates are fixed in the member list: the backend now accepts the census.
    mockValidateCensus.mockResolvedValue('ok')
    const checksBefore = mockValidateCensus.mock.calls.length
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mockValidateCensus).toHaveBeenCalledTimes(checksBefore + 1)
    expect(storedCensus()).toEqual({ credentials: ['name'], use2FA: false, use2FAMethod: 'email' })
  })

  it('reads a duplicate in voter choice as sharing either contact', async () => {
    mockValidateCensus.mockRejectedValue(
      membersError({ memberIds: ['m1'], duplicates: ['m2', 'm3'], missingData: null })
    )
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await chooseCode(user, 'voter_choice')

    await waitFor(() =>
      expect(dialog.getByRole('status')).toHaveTextContent(
        "2 members share the same Member Number and Email or Phone, so they can't be told apart."
      )
    )
  })

  it('names the details a shown result was checked for, not the ones ticked since', async () => {
    mockValidateCensus
      .mockRejectedValueOnce(membersError({ memberIds: ['m1'], duplicates: ['m2', 'm3'], missingData: null }))
      .mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)
    await user.click(dialog.getByRole('checkbox', { name: /member number/i }))
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'invalid'))

    // The re-check for the new details never answers here, so the old result stays on screen.
    await user.click(dialog.getByRole('checkbox', { name: /birth date/i }))

    const status = dialog.getByRole('status')
    expect(status).toHaveAttribute('data-status', 'checking')
    expect(status).toHaveTextContent("2 members share the same Member Number, so they can't be told apart.")
    expect(status).not.toHaveTextContent(/birth date/i)
  })

  it('asks for a choice before saving an empty configuration, without calling the backend', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await user.click(dialog.getByTestId('voter-auth-save'))

    const status = dialog.getByRole('status')
    expect(status).toHaveTextContent(/at least one detail or a code/i)
    expect(status).toHaveFocus()
    expect(mockValidateCensus).not.toHaveBeenCalled()
  })

  it('accepts a one-time code without any other detail', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={null} />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'sms')
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(storedCensus()).toEqual({ credentials: [], use2FA: true, use2FAMethod: 'sms' })
  })

  it('reports no two-factor method when no code is sent', async () => {
    const user = userEvent.setup()
    render(<TestForm initialCensus={{ credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'sms' }} />)
    const dialog = await openDialog(user)

    await chooseCode(user, 'none')
    await waitFor(() => expect(dialog.getByRole('status')).toHaveAttribute('data-status', 'valid'))
    await user.click(dialog.getByTestId('voter-auth-save'))

    await waitFor(() => expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1))
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'census_configured',
      props: { auth_fields_count: 1, two_fa: false, two_fa_method: 'none' },
    })
  })
})
