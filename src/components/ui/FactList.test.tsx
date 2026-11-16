import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { FactList } from './FactList'

describe('FactList', () => {
  it('renders each fact as a term and its value', () => {
    const { container } = render(
      <FactList
        facts={[
          { id: 'census', label: 'Census', value: '312 people' },
          { id: 'ends', label: 'Ends', value: '3 Dec' },
        ]}
      />
    )

    expect(container.querySelector('dl')).toBeInTheDocument()
    expect(container.querySelectorAll('dt')).toHaveLength(2)
    expect(container.querySelectorAll('dd')).toHaveLength(2)
    expect(screen.getByText('Census')).toBeInTheDocument()
    expect(screen.getByText('312 people')).toBeInTheDocument()
  })

  it('shows a fact tooltip when its value is hovered', async () => {
    render(<FactList facts={[{ id: 'anon', label: 'Anonymity', value: 'On', tooltip: 'Nobody can link votes' }]} />)

    await userEvent.hover(screen.getByText('On'))

    expect(await screen.findByText('Nobody can link votes')).toBeInTheDocument()
  })
})
