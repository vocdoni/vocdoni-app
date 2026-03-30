import type { ReactNode } from 'react'
import { mockUseElection, render, screen } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ProcessView } from './ProcessView'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionDescription: () => <div>Description</div>,
    ElectionResults: () => <div>Results</div>,
    ElectionStatusBadge: () => <div>Status</div>,
    ElectionTitle: () => <div>Title</div>,
  }
})

vi.mock('~components/Actions', () => ({
  ActionCancel: (props: any) => <button {...props} />,
  ActionContinue: (props: any) => <button {...props} />,
  ActionEnd: (props: any) => <button {...props} />,
  ActionPause: (props: any) => <button {...props} />,
  ActionsProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('react-player', () => ({
  default: () => null,
}))

describe('ProcessView', () => {
  beforeEach(() => {
    resetReactProvidersMock()
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          id: 'process-id',
          client: { explorerUrl: 'https://example.com' },
          election: { id: 'process-id' },
          participation: 3.33,
        }),
    })
  })

  it('allows the voting link actions to wrap without using pixel widths', () => {
    render(<ProcessView />)
    const votingLinkInput = screen.getByRole('textbox')
    const votingLinkActions = votingLinkInput.parentElement

    expect(votingLinkActions).toHaveStyle({ flexWrap: 'wrap' })
    expect(getComputedStyle(votingLinkInput).flex).toBe('1 1 18rem')
  })
})
