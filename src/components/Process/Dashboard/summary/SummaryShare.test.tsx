import { render, screen } from '~src/test-utils'
import { SummaryShare } from './SummaryShare'

const LINK = 'https://app.vocdoni.io/processes/0xabc'

const renderShare = (authFields: string[], twoFaFields: string[] = [], desktop = true) =>
  render(<SummaryShare link={LINK} authFields={authFields} twoFaFields={twoFaFields} desktop={desktop} />)

describe('SummaryShare', () => {
  it('names what the link asks voters for', () => {
    renderShare(['memberNumber', 'nationalId'])

    expect(screen.getByRole('heading', { name: 'To share' })).toBeInTheDocument()
    expect(screen.getByText('Public link. Asks for the member number and the national ID.')).toBeInTheDocument()
  })

  it('asks for one contact when the code can go to either', () => {
    renderShare(['memberNumber'], ['email', 'phone'])

    expect(
      screen.getByText('Public link. Asks for the member number and the email or the phone number.')
    ).toBeInTheDocument()
  })

  it('says only that the link is public when it asks for nothing it can name', () => {
    renderShare([])

    expect(screen.getByText('Public link.')).toBeInTheDocument()
  })

  it('shows the address without its scheme, read only, with a named copy button', () => {
    renderShare(['memberNumber'])

    expect(screen.getByLabelText('Voting Link')).toHaveValue('app.vocdoni.io/processes/0xabc')
    expect(screen.getByLabelText('Voting Link')).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Copy the public link' })).toBeInTheDocument()
  })

  it('puts "Public link" at the end of the title line on a phone', () => {
    renderShare(['memberNumber'], [], false)

    expect(screen.getByText('Public link')).toBeInTheDocument()
    expect(screen.queryByText(/Asks for/)).toBeNull()
  })
})
