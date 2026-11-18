import { render, screen } from '~src/test-utils'
import { ReceiptCodes, shortVoteId } from './ReceiptCodes'

const items = [
  { id: 'q1', title: 'Comptes anuals de 2025', voteId: 'a3f1b2c3d4e5f60718293a4b5c6d9c2e' },
  { id: 'q2', title: 'Dues vocalies', voteId: '77b0aa11bb22cc3341da' },
]

describe('shortVoteId', () => {
  it('keeps the first and last four characters', () => {
    expect(shortVoteId('a3f1b2c3d4e5f60718293a4b5c6d9c2e')).toBe('a3f1…9c2e')
    expect(shortVoteId('abc123')).toBe('abc123')
  })
})

describe('ReceiptCodes', () => {
  it('shows each question with its shortened code and the full one on hover', () => {
    render(<ReceiptCodes items={items} />)

    expect(screen.getByText('Comptes anuals de 2025')).toBeInTheDocument()
    expect(screen.getByText('a3f1…9c2e')).toHaveAttribute('title', items[0].voteId)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('makes each code a link to its verification in a new tab when it has an address', () => {
    const linked = items.map((item) => ({ ...item, href: `https://explorer.example/verify/${item.voteId}` }))
    render(<ReceiptCodes items={linked} />)

    const link = screen.getByRole('link', { name: '77b0…41da' })
    expect(link).toHaveAttribute('href', 'https://explorer.example/verify/77b0aa11bb22cc3341da')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
