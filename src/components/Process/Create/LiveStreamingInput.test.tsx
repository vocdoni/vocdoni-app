import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { VideoPlayer } from '~components/ui/VideoPlayer'
import type { Process } from './common'
import { LiveStreamingInput } from './LiveStreamingInput'

vi.mock('~components/ui/VideoPlayer', () => ({ VideoPlayer: vi.fn(() => null) }))

const Wrapper = ({ streamUri = '' }: { streamUri?: string }) => {
  const methods = useForm<Process>({
    defaultValues: {
      streamUri,
    } as Process,
  })

  return (
    <FormProvider {...methods}>
      <LiveStreamingInput />
    </FormProvider>
  )
}

describe('LiveStreamingInput', () => {
  it('titles the preview player as a video, not as the form section', () => {
    render(<Wrapper streamUri='https://www.youtube.com/watch?v=dQw4w9WgXcQ' />)

    expect(vi.mocked(VideoPlayer).mock.lastCall?.[0]).toMatchObject({ title: 'Video' })
  })

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
