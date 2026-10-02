import { MemoryRouter } from 'react-router'
import { mockUseOrganization, render, screen, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { PersonCensuses } from './PersonCensuses'
import { isPhoneOnly, participantLookupFor, usePersonCensuses } from './usePersonCensuses'
import type { SelectedMember } from './useSelection'

const past = new Date(Date.now() - 86_400_000).toISOString()
const future = new Date(Date.now() + 86_400_000).toISOString()

const state = vi.hoisted(() => ({
  published: [] as unknown[],
  drafts: [] as unknown[],
  groups: [] as Record<string, unknown>[],
  memberIds: {} as Record<string, string[]>,
  meta: {} as Record<string, unknown>,
  participants: vi.fn(),
  fetch: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: state.fetch, currentAddress: '0xorg' }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { participants: state.participants } } }),
}))

vi.mock('~src/queries/processes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/processes')>()),
  usePublishedProcesses: () => ({ data: { pages: [{ processes: state.published }] }, isLoading: false }),
  useDraftProcesses: () => ({ data: { pages: [{ processes: state.drafts }] }, isLoading: false }),
}))

const vote = (id: string, census: Record<string, unknown>, status: string, published = true) => ({
  id,
  title: { default: id.toUpperCase() },
  census,
  questions: [{ status }],
  published,
  startDate: status === 'UPCOMING' ? future : past,
  endDate: future,
})

const group = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Group ${id}`,
  description: '',
  membersCount: 0,
  censusIds: [],
  createdAt: past,
  updatedAt: past,
  ...extra,
})

const anna = {
  id: 'a1',
  name: 'Anna',
  surname: 'Vila',
  email: 'Anna@Example.org',
  memberNumber: '42',
} as SelectedMember

const Harness = ({ member }: { member: SelectedMember }) => <PersonCensuses censuses={usePersonCensuses(member)} />

const renderFor = (member: SelectedMember) =>
  render(
    <MemoryRouter>
      <Harness member={member} />
    </MemoryRouter>
  )

describe('participantLookupFor', () => {
  it('looks a member up by a detail the vote signs in with, emails lowercase, never by phone', () => {
    expect(participantLookupFor(anna, { authFields: ['memberNumber'], twoFaFields: ['email'] } as never)).toEqual({
      field: 'memberNumber',
      value: '42',
    })
    expect(participantLookupFor(anna, { twoFaFields: ['email'] } as never)).toEqual({
      field: 'email',
      value: 'anna@example.org',
    })
    expect(participantLookupFor(anna, { twoFaFields: ['phone'] } as never)).toBeNull()
    expect(isPhoneOnly({ email: ' ' })).toBe(true)
  })
})

describe('PersonCensuses', () => {
  beforeEach(() => {
    state.groups = [group('everyone', { isAutoGroup: true }), group('board'), group('own-draft'), group('own-live')]
    state.memberIds = { board: ['a1'], 'own-draft': ['a1'], 'own-live': ['a1'] }
    state.meta = {
      'vg_own-draft': { processId: 'd1', kind: 'copy', createdAt: past },
      'vg_own-live': { processId: 'live1', kind: 'copy', createdAt: past },
    }
    state.published = [
      vote('live1', { groupId: 'own-live', twoFaFields: ['email'] }, 'ONGOING'),
      vote('soon1', { authFields: ['memberNumber'], twoFaFields: ['email'] }, 'UPCOMING'),
      vote('live2', { groupId: 'everyone', twoFaFields: ['email'] }, 'ONGOING'),
      vote('closed', { groupId: 'own-live', twoFaFields: ['email'] }, 'RESULTS'),
    ]
    state.drafts = [
      vote('d1', { groupId: 'own-draft' }, 'UPCOMING', false),
      vote('d2', { groupId: 'everyone' }, 'UPCOMING', false),
      vote('d3', { groupId: 'board-other' }, 'UPCOMING', false),
    ]
    state.participants.mockReset().mockImplementation(async (processId: string) => ({
      // Found in live1 and soon1, not in live2
      participants: processId === 'live2' ? [] : [{ memberId: 'a1', questions: [] }],
    }))
    state.fetch.mockReset().mockImplementation(async (url: string) => {
      if (url.endsWith('/meta')) return { meta: state.meta }
      const single = url.match(/groups\/([^/?]+)$/)
      if (single) return { ...group(single[1]), memberIds: state.memberIds[single[1]] ?? [] }
      if (url.includes('/groups'))
        return { groups: state.groups, pagination: { currentPage: 1, lastPage: 1, totalItems: state.groups.length } }
      return {}
    })
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }) })
  })

  it('lists the live and scheduled votes a lookup finds them in, their drafts and saved censuses, not closed votes', async () => {
    renderFor(anna)

    const list = await screen.findByRole('list')
    const names = within(list)
      .getAllByRole('link')
      .map((link) => link.textContent)
    expect(names).toEqual(['LIVE1', 'SOON1', 'D1', 'D2', 'Group board'])
    expect(within(list).getByRole('link', { name: 'LIVE1' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/live1'
    )
    expect(within(list).getByRole('link', { name: 'Group board' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/board'
    )

    // One exact lookup per running vote, by a detail it signs in with
    expect(state.participants).toHaveBeenCalledWith('live1', { field: 'email', value: 'anna@example.org' })
    expect(state.participants).toHaveBeenCalledWith('soon1', { field: 'memberNumber', value: '42' })
    expect(state.participants).toHaveBeenCalledWith('live2', { field: 'email', value: 'anna@example.org' })
    expect(state.participants).not.toHaveBeenCalledWith('closed', expect.anything())
  })

  it("says live votes can't be checked for someone with only a phone, and still shows drafts", async () => {
    renderFor({ id: 'a1', name: 'Pere', phone: 'hash' } as SelectedMember)

    expect(await screen.findByText("Can't check live votes for people with only a phone.")).toBeInTheDocument()
    expect(state.participants).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'D1' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LIVE1' })).toBeNull()
  })
})
