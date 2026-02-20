import { render, screen } from '~src/test-utils'
import { Markdown } from './Markdown'

describe('Markdown', () => {
  it('renders markdown with links and headings', () => {
    render(<Markdown>{'# Title\n\n[Link](https://example.com)'}</Markdown>)
    expect(screen.getByText('Title')).toBeInTheDocument()
    const link = screen.getByText('Link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('target', '_blank')
  })
})
