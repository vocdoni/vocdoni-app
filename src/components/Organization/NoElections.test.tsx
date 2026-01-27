import { render, screen } from '~src/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NoElections from './NoElections'

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ account: { address: '0xabc' } }),
  useOrganization: () => ({ organization: { address: '0xabc' } }),
}))

describe('NoElections', () => {
  it('renders the create voting button when user owns the org', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NoElections />
      </MemoryRouter>
    )

    expect(screen.getByText('menu.create')).toBeInTheDocument()
  })
})
