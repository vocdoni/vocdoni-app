import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { PromotionCodeInput } from './PromotionCodeInput'

const applyPromotionCode = vi.fn().mockResolvedValue({ type: 'success' })
const removePromotionCode = vi.fn().mockResolvedValue({ type: 'success' })

vi.mock('@stripe/react-stripe-js/checkout', () => ({
  useCheckout: () => ({
    type: 'success',
    checkout: {
      applyPromotionCode,
      removePromotionCode,
    },
  }),
}))

describe('PromotionCodeInput', () => {
  it('renders a remove icon after applying a code', async () => {
    const user = userEvent.setup()
    render(<PromotionCodeInput />)

    await user.type(screen.getByPlaceholderText(/enter code/i), 'PROMO')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(await screen.findByText('Code "PROMO" applied')).toBeInTheDocument()
    const removeButton = screen.getByRole('button', { name: /remove/i })
    expect(removeButton.querySelector('svg')).toBeTruthy()
  })
})
