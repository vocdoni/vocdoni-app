import { render, screen } from '~src/test-utils'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { NoOrganizations } from './NoOrganizations'

describe('NoOrganizations', () => {
  it('renders the create organization button', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NoOrganizations />
      </MemoryRouter>
    )

    expect(screen.getByText('Create your organization')).toBeInTheDocument()
  })
})
