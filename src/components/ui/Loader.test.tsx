import { render, screen } from '~src/test-utils'
import { InlineLoader, ListLoader, PageLoader } from './Loader'

describe('PageLoader', () => {
  it('shows the default label', () => {
    render(<PageLoader />)

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows a custom label in place of the default', () => {
    render(<PageLoader>Provisioning</PageLoader>)

    expect(screen.getByText('Provisioning')).toBeInTheDocument()
    expect(screen.queryByText('loading')).not.toBeInTheDocument()
  })
})

describe('ListLoader and InlineLoader', () => {
  it('render without a label', () => {
    const { container } = render(
      <>
        <ListLoader />
        <InlineLoader />
      </>
    )

    expect(container).not.toBeEmptyDOMElement()
    expect(screen.queryByText('loading')).not.toBeInTheDocument()
  })
})
