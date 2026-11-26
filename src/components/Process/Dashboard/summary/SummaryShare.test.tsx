import { render, screen } from '~src/test-utils'
import type { VoteState } from '~utils/vote-state'
import { SummaryShare } from './SummaryShare'

const LINK = 'https://app.vocdoni.io/processes/0xabc'

const renderShare = (state: VoteState = 'live') => render(<SummaryShare link={LINK} state={state} />)

describe('SummaryShare', () => {
  it('says what the link is and who to share it with', () => {
    renderShare()

    expect(screen.getByRole('heading', { name: 'To share' })).toBeInTheDocument()
    expect(screen.getByText('Link to the digital ballot box. Share it with the eligible voters.')).toBeInTheDocument()
  })

  it('shows the address without its scheme, read only, with a named copy button', () => {
    renderShare()

    expect(screen.getByLabelText('Voting Link')).toHaveValue('app.vocdoni.io/processes/0xabc')
    expect(screen.getByLabelText('Voting Link')).toHaveAttribute('readonly')
    // An icon alone at every width, named for a screen reader.
    expect(screen.getByRole('button', { name: 'Copy the public link' })).toHaveTextContent(/^$/)
  })

  it('says the link leads to the results once the vote is closed, and is left out of a canceled vote', () => {
    const { unmount } = renderShare('closed')
    expect(screen.getByText('Link to the public page of the vote, with its results.')).toBeInTheDocument()
    expect(screen.queryByText(/Share it with the eligible voters/)).not.toBeInTheDocument()
    unmount()

    renderShare('canceled')
    expect(screen.queryByRole('heading', { name: 'To share' })).not.toBeInTheDocument()
  })

  it('tells the organiser to share the link before the vote opens so voters have it ready', () => {
    renderShare('ready')
    expect(
      screen.getByText('The vote has not opened yet. Share the link so voters have it ready when it starts.')
    ).toBeInTheDocument()
    expect(screen.queryByText(/Share it with the eligible voters/)).not.toBeInTheDocument()
  })
})
