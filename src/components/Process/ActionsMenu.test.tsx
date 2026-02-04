import type { ReactNode } from 'react'
import { render, screen } from '~src/test-utils'
import { ActionsMenu } from './ActionsMenu'

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ account: { address: '0xabc' } }),
  useElection: () => ({
    election: { organizationId: '0xabc', status: 'ONGOING' },
  }),
  useActions: () => ({ loading: { continue: false, pause: false, end: false, cancel: false } }),
}))

vi.mock('~components/vocdoni-ui', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('~components/vocdoni-ui')
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
  it('renders actions menu button', () => {
    render(<ActionsMenu />)
    expect(screen.getByLabelText('Actions')).toBeInTheDocument()
  })
})
