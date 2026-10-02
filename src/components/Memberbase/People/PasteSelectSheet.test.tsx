import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { trackAnalyticsEvent } from '~utils/analytics'
import { PasteSelectSheet } from './PasteSelectSheet'

const mocks = vi.hoisted(() => ({
  loadIndex: vi.fn(),
  fetchPage: vi.fn(),
}))

vi.mock('~src/queries/members', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/members')>()),
  useLoadMemberIndex: () => mocks.loadIndex,
  useMembersPageFetcher: () => mocks.fetchPage,
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))

const anna = { id: 'a1', name: 'Anna', memberNumber: '0042', email: 'anna@example.test' }
const jordi = { id: 'j2', name: 'Jordi', memberNumber: '0043', email: 'jordi@example.test' }

const renderSheet = (total: number) => {
  const onSelect = vi.fn()
  const onOpenChange = vi.fn()
  render(<PasteSelectSheet open onOpenChange={onOpenChange} total={total} onSelect={onSelect} />)
  return { onSelect, onOpenChange }
}

describe('PasteSelectSheet', () => {
  beforeEach(() => {
    mocks.loadIndex.mockReset()
    mocks.fetchPage.mockReset()
    vi.mocked(trackAnalyticsEvent).mockClear()
  })

  it('matches a pasted list against the members in memory and selects who it names', async () => {
    const user = userEvent.setup()
    mocks.loadIndex.mockResolvedValue({ members: [anna, jordi], total: 2, capped: false })
    const { onSelect, onOpenChange } = renderSheet(2)

    await user.click(screen.getByRole('textbox', { name: 'Member numbers, emails or national IDs' }))
    await user.paste('0042\nJORDI@example.test; 9999\n0042')
    expect(screen.getByText('3 different values')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Find them' }))

    expect(await screen.findByText('2 found')).toBeInTheDocument()
    expect(screen.getByText(/1 not found/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show not found' }))
    const missing = await screen.findByText('9999')
    expect(missing.closest('.ph-no-capture')).not.toBeNull()
    expect(mocks.fetchPage).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Select them' }))
    expect(onSelect).toHaveBeenCalledWith([anna, jordi])
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'members_paste_select',
      props: { found: 2, not_found: 1 },
    })
  })

  it('checks at most 200 values, one search each, in organizations over 5,000 members', async () => {
    const user = userEvent.setup()
    mocks.fetchPage.mockImplementation(async ({ search }: { search: string }) => ({
      members: search === '1' ? [{ ...anna, memberNumber: '1' }] : [],
      pagination: { totalItems: 0 },
    }))
    renderSheet(6000)

    await user.click(screen.getByRole('textbox', { name: 'Member numbers, emails or national IDs' }))
    await user.paste(Array.from({ length: 250 }, (_, index) => String(index + 1)).join('\n'))
    expect(
      screen.getByText(
        'With more than 5,000 members, we check up to 200 values at a time. The first 200 will be checked.'
      )
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Find them' }))

    expect(await screen.findByText('1 found')).toBeInTheDocument()
    expect(mocks.fetchPage).toHaveBeenCalledTimes(200)
    expect(mocks.fetchPage).toHaveBeenCalledWith({ page: 1, limit: 100, search: '200' })
    expect(mocks.fetchPage).not.toHaveBeenCalledWith(expect.objectContaining({ search: '201' }))
    expect(screen.getByText('50 more values weren’t checked: paste up to 200 at a time.')).toBeInTheDocument()
    expect(mocks.loadIndex).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Select them' })).toBeEnabled())
  })
})
