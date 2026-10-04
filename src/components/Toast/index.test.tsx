import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { useToast } from '.'

const Trigger = ({ onAction }: { onAction: () => void }) => {
  const toast = useToast()
  return (
    <button
      type='button'
      onClick={() => toast({ title: 'Saved', type: 'success', action: { label: 'Undo', onClick: onAction } })}
    >
      Show
    </button>
  )
}

describe('Toast', () => {
  it('runs its action once per click', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<Trigger onAction={onAction} />)

    await user.click(screen.getByRole('button', { name: 'Show' }))
    await user.click(await screen.findByRole('button', { name: 'Undo' }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
