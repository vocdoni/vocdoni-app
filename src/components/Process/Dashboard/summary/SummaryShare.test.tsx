import { render, screen } from '~src/test-utils'
import type { VoteState } from '~utils/vote-state'
import { SummaryShare } from './SummaryShare'

const LINK = 'https://app.vocdoni.io/processes/0xabc'

const renderShare = (desktop = true, state: VoteState = 'live') =>
  render(<SummaryShare link={LINK} desktop={desktop} state={state} />)

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
    expect(screen.getByRole('button', { name: 'Copy the public link' })).toBeInTheDocument()
  })

  it('says what the link is on a phone too', () => {
    renderShare(false)

    expect(screen.getByText(/digital ballot box/)).toBeInTheDocument()
  })

  it('says the link leads to the results once the vote is closed, and is left out of a canceled vote', () => {
    const { unmount } = renderShare(true, 'closed')
    expect(screen.getByText('Link to the public page of the vote, with its results.')).toBeInTheDocument()
    expect(screen.queryByText(/Share it with the eligible voters/)).not.toBeInTheDocument()
    unmount()

    renderShare(true, 'canceled')
    expect(screen.queryByRole('heading', { name: 'To share' })).not.toBeInTheDocument()
  })
})
