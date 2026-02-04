import { render, screen } from '~src/test-utils'
import { ValidationErrorsAlert } from './ValidationErrorsAlert'

describe('ValidationErrorsAlert', () => {
  it('renders validation counts', () => {
    render(
      <ValidationErrorsAlert
        validationError={{
          error: 'Validation failed',
          code: 400,
          data: {
            memberIds: ['1', '2'],
            duplicates: ['1'],
            missingData: ['2'],
          },
        }}
      />
    )

    expect(screen.getByText('Validation Error')).toBeInTheDocument()
    expect(screen.getByText('2 users total')).toBeInTheDocument()
    expect(screen.getByText('1 users missing required fields')).toBeInTheDocument()
    expect(screen.getByText('1 duplicated users')).toBeInTheDocument()
  })
})
