import { render, screen, TestMemoryRouter } from '~src/test-utils'
import RowsPerPageSelect from './RowsPerPageSelect'

describe('RowsPerPageSelect', () => {
  it('names the select after its visible label', () => {
    render(
      <TestMemoryRouter>
        <RowsPerPageSelect />
      </TestMemoryRouter>
    )

    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument()
  })
})
