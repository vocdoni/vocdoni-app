import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { NoOrganizations } from './NoOrganizations'

describe('NoOrganizations', () => {
  it('renders the create organization button', () => {
    render(
      <TestMemoryRouter>
        <NoOrganizations />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Create your organization')).toBeInTheDocument()
  })
})
