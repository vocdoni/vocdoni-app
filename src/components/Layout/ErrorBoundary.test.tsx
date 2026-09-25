import { render, screen } from '@testing-library/react'
import { capturePosthogException } from '~utils/analytics'
import { ErrorBoundary } from './ErrorBoundary'

vi.mock('~utils/analytics', () => ({ capturePosthogException: vi.fn() }))

const Throws = (): never => {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders its children while they do not throw', () => {
    render(
      <ErrorBoundary fallback={<span>fallback</span>}>
        <span>content</span>
      </ErrorBoundary>
    )

    expect(screen.getByText('content')).toBeInTheDocument()
    expect(screen.queryByText('fallback')).not.toBeInTheDocument()
  })

  it('renders the fallback in place of children that throw, leaving their siblings alone', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      render(
        <>
          <ErrorBoundary fallback={<span>fallback</span>}>
            <Throws />
          </ErrorBoundary>
          <span>sibling</span>
        </>
      )

      expect(screen.getByText('fallback')).toBeInTheDocument()
      expect(screen.getByText('sibling')).toBeInTheDocument()
      // contained errors never reach window.onerror, so the boundary reports them itself
      expect(capturePosthogException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'boom' }),
        expect.objectContaining({ component_stack: expect.any(String) })
      )
    } finally {
      consoleError.mockRestore()
    }
  })
})
