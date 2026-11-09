import { render, screen } from '~src/test-utils'
import { SectionCard } from './SectionCard'

describe('SectionCard', () => {
  it('renders a heading, its action and the content', () => {
    render(
      <SectionCard title='Sign-in' action={<button>Edit</button>}>
        Code by email
      </SectionCard>
    )

    expect(screen.getByRole('heading', { name: 'Sign-in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByText('Code by email')).toBeInTheDocument()
  })

  it('renders no header without a title or action', () => {
    render(<SectionCard>Only content</SectionCard>)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
