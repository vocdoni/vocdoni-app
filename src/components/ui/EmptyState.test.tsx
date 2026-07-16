import { LuUserPlus } from 'react-icons/lu'
import { render, screen } from '~src/test-utils'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title, description and a CTA', () => {
    render(
      <EmptyState icon={LuUserPlus} title='No members' description='Invite someone to get started'>
        <button>Invite</button>
      </EmptyState>
    )

    expect(screen.getByText('No members')).toBeInTheDocument()
    expect(screen.getByText('Invite someone to get started')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument()
  })

  it('renders an illustration when given an image', () => {
    render(<EmptyState image='/illustration.png' imageAlt='Nothing here' title='Empty' />)

    expect(screen.getByRole('img', { name: 'Nothing here' })).toBeInTheDocument()
  })
})
