import userEvent from '@testing-library/user-event'
import { StaleDraftError } from '../census/voteGroup'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { mockUseOrganization, render, screen, TestMemoryRouter, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { defaultProcessValues, Process } from '../common'
import { type DraftControls, EditorContext } from '../editor-context'
import { buildCensusSpec } from '../request'
import { WhoCanVote } from './WhoCanVote'

const data = vi.hoisted(() => ({
  groups: [] as Record<string, unknown>[],
  details: {} as Record<string, { memberIds?: string[]; membersCount?: number; isAutoGroup?: boolean }>,
  markers: new Map<string, unknown>(),
  testVote: null as unknown,
  votes: [] as unknown[],
  missingEmail: [] as string[],
  track: vi.fn(),
  removeMembers: vi.fn(),
}))

const api = vi.hoisted(() => ({
  readMemberIds: vi.fn(async (groupId: string) => data.details[groupId]?.memberIds ?? []),
  readGroup: vi.fn(),
  createGroup: vi.fn(async () => 'own-new'),
  deleteGroup: vi.fn(async () => undefined),
  mark: vi.fn(async () => undefined),
  unmark: vi.fn(async () => undefined),
  markers: vi.fn(async () => data.markers),
}))

vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ bearedFetch: vi.fn() }) }))

vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({ data: data.groups, isSuccess: true, isLoading: false, isError: false }),
  useGroup: (groupId?: string) => ({ data: groupId ? data.details[groupId] : undefined }),
  useUpdateGroupWithReport: () => ({ mutateAsync: data.removeMembers }),
}))

vi.mock('~src/queries/voteGroups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/voteGroups')>()),
  useVoteGroupMarkers: () => ({ markers: data.markers, ready: true, isVoteOwned: () => false }),
  useVoteGroupApi: () => api,
  useTestVote: () => data.testVote,
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      elections: {
        validateCensus: async ({ census }: { census: { twoFaFields: string[] } }) => {
          if (census.twoFaFields[0] === 'email' && data.missingEmail.length) {
            const { VocdoniApiError } = await import('@vocdoni/api-client')
            throw new VocdoniApiError(400, { data: { missingData: data.missingEmail } }, 'invalid')
          }
          return { valid: true }
        },
      },
    },
  }),
}))

vi.mock('~components/Memberbase/Censuses/useCensusIndex', () => ({
  useAllVotes: () => ({ all: data.votes, published: data.votes, drafts: [], isLoading: false }),
}))

vi.mock('~components/Memberbase/Censuses/CensusDetail', () => ({
  CensusDetail: (props: { kind: string; processId?: string; groupId?: string }) => (
    <p>
      census detail {props.kind} {props.processId ?? props.groupId}
    </p>
  ),
}))

vi.mock('~components/Memberbase/Censuses/MemberPicker', () => ({
  MemberPicker: ({ onChange }: { onChange: (selected: Map<string, unknown>) => void }) => (
    <button
      type='button'
      onClick={() =>
        onChange(
          new Map([
            ['m1', { id: 'm1', name: 'Anna' }],
            ['m2', { id: 'm2', name: 'Jordi' }],
          ])
        )
      }
    >
      pick two
    </button>
  ),
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: data.track,
}))

const Watch = () => {
  const { watch } = useFormContext<Process>()
  return <output data-testid='form'>{JSON.stringify({ groupId: watch('groupId'), census: watch('census') })}</output>
}

const formState = () => JSON.parse(screen.getByTestId('form').textContent!)

let lastForm: () => Process

const Harness = ({ values = {}, draft }: { values?: Partial<Process>; draft: DraftControls }) => {
  const methods = useForm<Process>({ defaultValues: { ...defaultProcessValues, title: 'Assemblea', ...values } })
  lastForm = methods.getValues
  return (
    <TestMemoryRouter>
      <FormProvider {...methods}>
        <EditorContext.Provider value={{ attempted: false, review: vi.fn(), reviewing: false, draft }}>
          <WhoCanVote />
          <Watch />
        </EditorContext.Provider>
      </FormProvider>
    </TestMemoryRouter>
  )
}

const draftControls = (
  id: string | null = 'draft-1'
): DraftControls & { saveNow: ReturnType<typeof vi.fn>; saveWithLatest: ReturnType<typeof vi.fn> } => ({
  id,
  ensure: vi.fn(async () => id),
  saveNow: vi.fn(async () => id ?? 'draft-new'),
  saveWithLatest: vi.fn(async () => id ?? 'draft-new'),
  pause: vi.fn(() => () => undefined),
  flush: vi.fn(async () => undefined),
})

const EVERYONE = { id: 'all', title: 'All', membersCount: 120, isAutoGroup: true }
const SAVED = { id: 'quota', title: 'Quota pagada', membersCount: 3 }

describe('WhoCanVote', () => {
  beforeEach(() => {
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }) })
    data.groups = [EVERYONE, SAVED, { id: 'own-old', title: 'Old vote — census', membersCount: 2 }]
    data.details = { quota: { memberIds: ['m1', 'm2', 'm3'] }, 'own-old': { memberIds: ['m1', 'm9'] } }
    data.markers = new Map([
      ['own-old', { processId: 'draft-1', kind: 'copy', createdAt: '2026-10-02T09:00:00Z', fromId: 'quota' }],
    ])
    data.testVote = null
    data.votes = []
    data.missingEmail = []
    data.track.mockReset()
    data.removeMembers.mockReset()
    Object.values(api).forEach((fn) => fn.mockClear())
  })

  it('offers the four sources, with Everyone chosen and its size', () => {
    render(<Harness values={{ groupId: 'all' }} draft={draftControls()} />)

    const everyone = screen.getByRole('radio', { name: /Everyone/ })
    expect(everyone).toBeChecked()
    expect(screen.getByText("All 120 members. New members join until you publish; then it's frozen.")).toBeVisible()
    expect(screen.getByRole('radio', { name: /From a saved census/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Choose people/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Same as a previous vote/ })).toBeInTheDocument()
  })

  it('gives the vote its own copy of a saved census, with email codes so the census is saved', async () => {
    const user = userEvent.setup()
    const draft = draftControls()
    render(<Harness values={{ groupId: 'all' }} draft={draft} />)

    await user.click(screen.getByRole('radio', { name: /From a saved census/ }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved census' }), 'quota')

    await waitFor(() => expect(formState().groupId).toBe('own-new'))
    expect(api.createGroup).toHaveBeenCalledWith({
      title: 'Assemblea — census',
      description: "Census of 'Assemblea'. Changing it changes who can vote.",
      memberIds: ['m1', 'm2', 'm3'],
    })
    expect(api.mark).toHaveBeenCalledWith(
      'own-new',
      expect.objectContaining({ processId: 'draft-1', kind: 'copy', fromId: 'quota', source: 'saved' })
    )
    expect(draft.saveWithLatest).toHaveBeenCalled()
    expect(formState().census).toEqual({ credentials: [], use2FA: true, use2FAMethod: 'email' })
    // With a sign-in set, the request carries the group
    expect(buildCensusSpec(lastForm()).groupId).toBe('own-new')
    expect(data.track).toHaveBeenCalledWith({
      name: 'member_group_created',
      props: { group_size: 3, source: 'saved' },
    })
    // The saved census itself is never touched
    expect(api.deleteGroup).not.toHaveBeenCalled()
  })

  it('leaves a draft changed in another tab as it is, offering to reload', async () => {
    const user = userEvent.setup()
    const draft = draftControls()
    draft.saveWithLatest.mockRejectedValue(new StaleDraftError(new Error('409')))
    render(<Harness values={{ groupId: 'all' }} draft={draft} />)

    await user.click(screen.getByRole('radio', { name: /From a saved census/ }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved census' }), 'quota')

    expect(
      await screen.findByText('This draft was changed somewhere else. Reload the page and try again.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(formState().groupId).toBe('all')
    expect(draft.saveNow).not.toHaveBeenCalled()
  })

  it('makes a census of people chosen by hand', async () => {
    const user = userEvent.setup()
    render(<Harness values={{ groupId: 'all' }} draft={draftControls()} />)

    await user.click(screen.getByRole('radio', { name: /Choose people/ }))
    const sheet = await screen.findByRole('dialog', { name: 'Choose who can vote' })
    await user.click(within(sheet).getByRole('button', { name: 'pick two' }))
    await user.click(within(sheet).getByRole('tab', { name: 'Selected (2)' }))
    expect(within(sheet).getByText('Jordi')).toBeInTheDocument()
    await user.click(within(sheet).getByRole('button', { name: 'Use 2 people' }))

    await waitFor(() => expect(formState().groupId).toBe('own-new'))
    expect(api.createGroup).toHaveBeenCalledWith(expect.objectContaining({ memberIds: ['m1', 'm2'] }))
    expect(api.mark).toHaveBeenCalledWith('own-new', expect.not.objectContaining({ from: expect.anything() }))
  })

  it('asks for a name before a vote that was never saved can have its own census', async () => {
    const user = userEvent.setup()
    const draft = draftControls(null)
    render(<Harness values={{ groupId: 'all', title: '' }} draft={draft} />)

    await user.click(screen.getByRole('radio', { name: /From a saved census/ }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved census' }), 'quota')

    expect(await screen.findByText('Name your vote first, so it can have a census of its own')).toBeInTheDocument()
    expect(api.createGroup).not.toHaveBeenCalled()
    expect(formState().groupId).toBe('all')
  })

  it('sums up the vote’s own census instead of the cards, with a way to edit it', async () => {
    const user = userEvent.setup()
    render(<Harness values={{ groupId: 'own-old' }} draft={draftControls()} />)

    expect(screen.queryByRole('radio')).toBeNull()
    expect(screen.getByText('2 people')).toBeInTheDocument()
    expect(screen.getByText("Copied from 'Quota pagada' on 2 Oct")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit census' }))
    expect(await screen.findByText('census detail vote draft-1')).toBeInTheDocument()
  })

  it('starts over: back to Everyone, then deletes the old copy once the draft is saved', async () => {
    const user = userEvent.setup()
    const draft = draftControls()
    render(
      <Harness
        values={{ groupId: 'own-old', census: { credentials: [], use2FA: true, use2FAMethod: 'sms' } }}
        draft={draft}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Start over' }))
    await user.click(screen.getByRole('radio', { name: /Everyone/ }))

    await waitFor(() => expect(api.unmark).toHaveBeenCalledWith('own-old'))
    expect(formState().groupId).toBe('all')
    expect(draft.saveWithLatest).toHaveBeenCalled()
    expect(api.deleteGroup).toHaveBeenCalledWith('own-old')
    // An existing sign-in is kept
    expect(formState().census.use2FAMethod).toBe('sms')
  })

  it('replaces the old copy when starting over from another source', async () => {
    const user = userEvent.setup()
    render(<Harness values={{ groupId: 'own-old' }} draft={draftControls()} />)

    await user.click(screen.getByRole('button', { name: 'Start over' }))
    await user.click(screen.getByRole('radio', { name: /From a saved census/ }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Saved census' }), 'quota')

    await waitFor(() => expect(api.deleteGroup).toHaveBeenCalledWith('own-old'))
    expect(api.mark.mock.invocationCallOrder[0]).toBeLessThan(api.deleteGroup.mock.invocationCallOrder[0])
    expect(formState().groupId).toBe('own-new')
  })

  it('copies a previous vote’s census, and says why one with no list cannot be copied', async () => {
    const user = userEvent.setup()
    data.groups.push({ id: 'junta', title: 'Junta', membersCount: 9 })
    data.details.junta = { memberIds: ['j1', 'j2'] }
    data.votes = [
      {
        id: 'v1',
        title: { default: 'Junta 2025' },
        published: true,
        census: { groupId: 'junta', size: 9 },
        questions: [{ status: 'RESULTS' }],
        endDate: '2025-01-01',
      },
      {
        id: 'v2',
        title: { default: 'Picked by hand' },
        published: true,
        census: { size: 4 },
        questions: [{ status: 'RESULTS' }],
        endDate: '2025-01-01',
      },
      { id: 'draft-1', title: { default: 'This one' }, published: false, census: {} },
    ]
    render(<Harness values={{ groupId: 'all' }} draft={draftControls()} />)

    await user.click(screen.getByRole('radio', { name: /Same as a previous vote/ }))
    const sheet = await screen.findByRole('dialog', { name: 'Same as a previous vote' })
    expect(within(sheet).queryByText('This one')).toBeNull()
    const picked = within(sheet).getByRole('button', { name: /Picked by hand/ })
    expect(picked).toBeDisabled()
    expect(picked).toHaveTextContent("Its people were picked one by one, so there's no list to copy.")

    await user.click(within(sheet).getByRole('button', { name: /Junta 2025/ }))

    await waitFor(() => expect(formState().groupId).toBe('own-new'))
    expect(api.createGroup).toHaveBeenCalledWith(expect.objectContaining({ memberIds: ['j1', 'j2'] }))
    expect(api.mark).toHaveBeenCalledWith('own-new', expect.objectContaining({ fromId: 'junta', source: 'previous' }))
  })

  it('tells how voters get their codes, then that the census is ready, and reports it once', async () => {
    render(
      <Harness
        values={{ groupId: 'all', census: { credentials: [], use2FA: true, use2FAMethod: 'email' } }}
        draft={draftControls(null)}
      />
    )

    expect(await screen.findByText('Census ready')).toBeInTheDocument()
    expect(screen.getByText('120 voters')).toBeInTheDocument()
    expect(screen.getByText('120 get their code by email')).toBeInTheDocument()
    expect(data.track).toHaveBeenCalledTimes(1)
    expect(data.track).toHaveBeenCalledWith({
      name: 'census_configured',
      props: expect.objectContaining({ source: 'everyone', voters: 120, is_test: false, two_fa_method: 'email' }),
    })
  })

  it('warns when some voters can’t get a code', async () => {
    data.missingEmail = ['m1', 'm2']
    render(
      <Harness
        values={{ groupId: 'all', census: { credentials: [], use2FA: true, use2FAMethod: 'email' } }}
        draft={draftControls()}
      />
    )

    expect(await screen.findByText("2 voters can't get a code: no email or mobile for it")).toBeInTheDocument()
    expect(screen.queryByText('Census ready')).toBeNull()
  })

  it('doesn’t report a draft opened as it was saved', async () => {
    render(
      <Harness
        values={{ groupId: 'all', census: { credentials: [], use2FA: true, use2FAMethod: 'email' } }}
        draft={draftControls('draft-1')}
      />
    )
    expect(await screen.findByText('Census ready')).toBeInTheDocument()
    expect(data.track).not.toHaveBeenCalled()
  })

  it('warns about the test vote’s people and leaves them out of the vote’s own census', async () => {
    const user = userEvent.setup()
    data.testVote = { processId: 'test-draft', groupId: 'test', memberIds: ['m9', 'x'] }
    render(<Harness values={{ groupId: 'own-old' }} draft={draftControls()} />)

    expect(screen.getByText('1 test person is in your members')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Leave them out' }))

    expect(data.removeMembers).toHaveBeenCalledWith({ groupId: 'own-old', body: { removeMembers: ['m9'] } })
  })

  it('says nothing about test people in the test vote itself', () => {
    data.testVote = { processId: 'draft-1', groupId: 'test', memberIds: ['m9'] }
    render(<Harness values={{ groupId: 'all' }} draft={draftControls()} />)
    expect(screen.queryByText(/test pe/)).toBeNull()
  })
})
