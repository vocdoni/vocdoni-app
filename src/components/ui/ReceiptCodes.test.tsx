import userEvent from '@testing-library/user-event'
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

  it('makes each code a named button when it can be copied', async () => {
    const onCopy = vi.fn()
    render(<ReceiptCodes items={items} onCopy={onCopy} copyLabel={(item) => `Copia el codi: ${item.title}`} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copia el codi: Dues vocalies' }))
    expect(onCopy).toHaveBeenCalledWith(items[1])
  })
})
