import userEvent from '@testing-library/user-event'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteHeader } from './VoteHeader'

// The "More" menu through the real ResponsiveMenu (desktop dropdown), so order, danger and links are the page's own.
let currentElection: VotingProcessResponse

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})
vi.mock('~components/Actions', () => {
  const ActionButton = ({ children }: { children: ReactNode }) => <button>{children}</button>
  return {
    ActionPause: ActionButton,
    ActionContinue: ActionButton,
    ActionEnd: ActionButton,
    CancelVoteDialog: () => null,
    EndVoteDialog: () => null,
  }
})
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState } = await import('~utils/vote-state')
  return {
    useActions: () => {
      const now = new Date()
      const state = deriveVoteState(currentElection, now)
      return { canManage: true, disabled: false, now, state, votePause: { isHeld: false, heldQuestionIds: [] } }
    },
  }
})
// The dropdown, not the phone's sheet: the one width-dependent behaviour ResponsiveMenu has.
vi.mock('~components/ui/useIsMobile', () => ({ useIsMobile: () => false }))
vi.mock('./use-clone-as-draft', () => ({ useCloneAsDraft: () => ({ cloneAsDraft: vi.fn(), isCloning: false }) }))
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: null }) }))
vi.mock('../VotingReportPdf/VotingReportPdfButton', () => ({
  useVotingReportPdfDownload: () => ({ report: {}, isPendingResults: false, isGenerating: false, download: vi.fn() }),
}))

const live = {
  id: '0xabc',
  orgAddress: '0xorg',
  title: { default: 'Board election' },
  startDate: '2026-01-01T10:00:00Z',
  endDate: '2999-01-01T10:00:00Z',
  published: true,
  chainId: 'vocdoni/DEV/36',
  census: {},
  questions: [{ id: 'q1', title: { default: 'Q' }, choices: [], status: 'ONGOING', upstreamId: 'chain-1' }],
} as unknown as VotingProcessResponse

it('ends the vote menu with the destructive cancel and opens the outside pages in a new tab', async () => {
  currentElection = live
  setReactProvidersMock({ useElection: () => ({ election: live, status: 'ONGOING' }) })
  render(
    <TestMemoryRouter>
      <VoteHeader />
    </TestMemoryRouter>
  )

  // One name at every width: the word "More" shows from `lg`, the icon below it.
  await userEvent.click(screen.getByRole('button', { name: 'More actions' }))

  const items = await screen.findAllByRole('menuitem')
  expect(items.map((item) => item.textContent)).toEqual([
    'Show as voter',
    'Duplicate the vote',
    'View in explorer',
    'Cancel the vote',
  ])
  expect(items.at(-1)).toHaveAttribute('data-danger', 'true')
  for (const name of ['Show as voter', 'View in explorer']) {
    expect(screen.getByRole('menuitem', { name })).toHaveAttribute('target', '_blank')
  }
})

it("links the explorer of the vote's own chain, and leaves the link out on an unknown chain", async () => {
  const open = async (election: VotingProcessResponse) => {
    currentElection = election
    setReactProvidersMock({ useElection: () => ({ election, status: 'ONGOING' }) })
    const view = render(
      <TestMemoryRouter>
        <VoteHeader />
      </TestMemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }))
    await screen.findAllByRole('menuitem')
    return view
  }

  const { unmount } = await open(live)
  expect(screen.getByRole('menuitem', { name: 'View in explorer' })).toHaveAttribute(
    'href',
    'https://dev.explorer.vote/process/chain-1'
  )
  unmount()

  await open({ ...live, chainId: 'vocdoni/TEST/1' } as VotingProcessResponse)
  expect(screen.queryByRole('menuitem', { name: 'View in explorer' })).toBeNull()
})
