import type { ReactNode } from 'react'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import { ActionsMenu } from './ActionsMenu'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ActionsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    ActionContinue: (props: any) => <button {...props} />,
    ActionPause: (props: any) => <button {...props} />,
    ActionEnd: (props: any) => <button {...props} />,
    ActionCancel: (props: any) => <button {...props} />,
  }
})

describe('ActionsMenu', () => {
  beforeEach(() => {
    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { orgAddress: '0xabc', questions: [] }, status: 'ONGOING' }),
      useActions: () => ({ loading: { continue: false, pause: false, end: false, cancel: false } }),
    })
  })

  it('renders actions menu button', () => {
    render(<ActionsMenu />)
    expect(screen.getByLabelText('Actions')).toBeInTheDocument()
  })
})
