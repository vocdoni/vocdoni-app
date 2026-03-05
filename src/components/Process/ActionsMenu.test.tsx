import type { ReactNode } from 'react'
import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ActionsMenu } from './ActionsMenu'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  return {
    ...actual,
    ActionsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    ActionContinue: (props: any) => <button {...props} />,
    ActionPause: (props: any) => <button {...props} />,
    ActionEnd: (props: any) => <button {...props} />,
    ActionCancel: (props: any) => <button {...props} />,
  }
})

describe('ActionsMenu', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({ account: { address: '0xabc' } }),
      useElection: () => mockUseElection({ election: { organizationId: '0xabc', status: 'ONGOING' } }),
      useActions: () => ({ loading: { continue: false, pause: false, end: false, cancel: false } }),
    })
  })

  it('renders actions menu button', () => {
    render(<ActionsMenu />)
    expect(screen.getByLabelText('Actions')).toBeInTheDocument()
  })
})
