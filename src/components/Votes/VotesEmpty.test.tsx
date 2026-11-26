import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { VotesEmpty } from './VotesEmpty'

const renderEmpty = (canCreate: boolean) =>
  render(
    <TestMemoryRouter>
      <VotesEmpty canCreate={canCreate} />
    </TestMemoryRouter>
  )

describe('VotesEmpty', () => {
  it('invites an organizer to create the first vote, and says what each state means to them', () => {
    renderEmpty(true)

    expect(screen.getByRole('link', { name: 'Create a vote' })).toBeInTheDocument()
    expect(screen.getByText(/Create the first one whenever you like/)).toBeInTheDocument()
    expect(
      screen.getByText('You prepare it at your own pace. Nobody sees it and it costs nothing.')
    ).toBeInTheDocument()
  })

  it('tells someone who cannot create votes what the empty list means, with no creator copy or action', () => {
    renderEmpty(false)

    expect(screen.queryByRole('link', { name: 'Create a vote' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Create the first one/)).not.toBeInTheDocument()
    expect(screen.queryByText(/you follow|You have the result|You prepare/)).not.toBeInTheDocument()
    expect(screen.getByText('When the organization runs a vote, it shows here with its state.')).toBeInTheDocument()
    expect(screen.getByText('The result is in.')).toBeInTheDocument()
  })
})
