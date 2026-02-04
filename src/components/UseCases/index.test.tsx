import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
import UseCases from './index'

describe('UseCases', () => {
  it('renders the section heading', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <UseCases />
      </MemoryRouter>
    )

    expect(screen.getAllByText('Use Cases').length).toBeGreaterThan(0)
  })
})
