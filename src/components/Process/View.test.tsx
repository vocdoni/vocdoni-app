import { render, screen } from '~src/test-utils'
import { describe, expect, it } from 'vitest'
import { ProcessInfoCard } from './View'

describe('ProcessInfoCard', () => {
  it('renders label and description', () => {
    render(<ProcessInfoCard label='Participants' description='42 voters' />)

    expect(screen.getByText('Participants')).toBeInTheDocument()
    expect(screen.getByText('42 voters')).toBeInTheDocument()
  })
})
