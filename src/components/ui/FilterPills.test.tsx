import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { render, screen, within } from '~src/test-utils'
import { FilterPills } from './FilterPills'

const items = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'flagged', label: 'Flagged', count: 3 },
]

describe('FilterPills', () => {
  it('renders links in a nav, marking the current one', () => {
    render(
      <MemoryRouter>
        <FilterPills label='Filter people' items={items} current='flagged' href={(value) => `/people/${value}`} />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: 'Filter people' })
    expect(within(nav).getByRole('link', { name: /Flagged\s*3/ })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: /All\s*12/ })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByRole('link', { name: /All/ })).toHaveAttribute('href', '/people/all')
  })

  it('renders toggle buttons without href, and reports the choice', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FilterPills label='Filter people' items={items} current='all' onSelect={onSelect} />)

    const group = screen.getByRole('group', { name: 'Filter people' })
    expect(within(group).getByRole('button', { name: /All/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(within(group).getByRole('button', { name: /Flagged/ }))
    expect(onSelect).toHaveBeenCalledWith('flagged')
  })
})
