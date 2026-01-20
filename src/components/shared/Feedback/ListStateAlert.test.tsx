import { render, screen } from '@testing-library/react'
import { ListStateAlert } from './ListStateAlert'

const matchMediaMock = (query: string) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }
}

describe('ListStateAlert', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  it('renders title and description when show is true', () => {
    render(<ListStateAlert show status='info' title='No items found' description='Try again later' />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try again later')).toBeInTheDocument()
  })

  it('returns null when show is false', () => {
    render(<ListStateAlert show={false} status='info' title='Hidden' description='Hidden description' />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
