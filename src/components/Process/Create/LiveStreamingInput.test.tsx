import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import type { Process } from './common'
import { LiveStreamingInput } from './LiveStreamingInput'

vi.mock('~components/Layout/SubscriptionLockedContent', () => ({
  SubscriptionLockedContent: ({ children }) => <>{children({ isLocked: false })}</>,
}))

const Wrapper = () => {
  const methods = useForm<Process>({
    defaultValues: {
      streamUri: '',
    } as Process,
  })

  return (
    <FormProvider {...methods}>
      <LiveStreamingInput />
    </FormProvider>
  )
}

describe('LiveStreamingInput', () => {
  it('renders the live streaming accordion and input when expanded', async () => {
    const user = userEvent.setup()

    render(<Wrapper />)

    const trigger = screen.getByRole('button', {
      name: /attach video/i,
    })

    await user.click(trigger)

    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeInTheDocument()
  })
})
