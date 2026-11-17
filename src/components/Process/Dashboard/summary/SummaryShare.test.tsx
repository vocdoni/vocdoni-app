import { render, screen } from '~src/test-utils'
import { SummaryShare } from './SummaryShare'

const LINK = 'https://app.vocdoni.io/processes/0xabc'

const renderShare = (desktop = true) => render(<SummaryShare link={LINK} desktop={desktop} />)

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

  it('puts "Public link" at the end of the title line on a phone', () => {
    renderShare(false)

    expect(screen.getByText('Public link')).toBeInTheDocument()
    expect(screen.queryByText(/digital ballot box/)).toBeNull()
  })
})
