import { fireEvent, render, screen, waitFor } from '~src/test-utils'
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
  })

  it('copies the full code when a code has no address to check it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<ReceiptCodes items={items} />)

    fireEvent.click(screen.getByRole('button', { name: 'a3f1…9c2e: copy the full code of Comptes anuals de 2025' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(items[0].voteId))
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
