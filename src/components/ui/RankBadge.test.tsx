import { render, screen } from '~src/test-utils'
import { RankBadge } from './RankBadge'

describe('RankBadge', () => {
  it('shows the next free position on an option not ranked yet', () => {
    render(<RankBadge value='3' />)

    expect(screen.getByText('3')).not.toHaveAttribute('data-set')
  })

  it('marks a given rank', () => {
    render(<RankBadge value='1' set />)

    expect(screen.getByText('1')).toHaveAttribute('data-set')
  })
})
