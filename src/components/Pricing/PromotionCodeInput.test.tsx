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
  beforeEach(() => {
    applyPromotionCode.mockClear()
    removePromotionCode.mockClear()
  })

  it('applies the typed code to the checkout and can remove it again', async () => {
    const user = userEvent.setup()
    render(<PromotionCodeInput />)

    await user.type(screen.getByPlaceholderText(/enter code/i), 'PROMO')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(await screen.findByText('Code "PROMO" applied')).toBeInTheDocument()
    expect(applyPromotionCode).toHaveBeenCalledWith('PROMO')

    await user.click(screen.getByRole('button', { name: /remove/i }))

    expect(removePromotionCode).toHaveBeenCalledTimes(1)
    expect(await screen.findByPlaceholderText(/enter code/i)).toBeInTheDocument()
  })

  it('shows the checkout error and keeps the input when the code is rejected', async () => {
    applyPromotionCode.mockResolvedValueOnce({ type: 'error', error: { message: 'Code expired' } })
    const user = userEvent.setup()
    render(<PromotionCodeInput />)

    await user.type(screen.getByPlaceholderText(/enter code/i), 'OLD')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    expect(await screen.findByText('Code expired')).toBeInTheDocument()
    expect(screen.queryByText(/applied/)).not.toBeInTheDocument()
  })
})
